import 'reflect-metadata'
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';
import { existsSync, mkdirSync, readFileSync } from 'fs';
import helmet from 'helmet';
import { XssInterceptor } from './utils/xss.interceptor';
import * as cookieParser from 'cookie-parser';
import { MetricsInterceptor } from './metrics/metrics.interceptor';


async function bootstrap() {
  // Ensure uploads directories exist (one per file type)
  const uploadSubDirs = ['images', 'videos', 'audio', 'documents'];
  for (const subDir of uploadSubDirs) {
    const dirPath = `/app/uploads/chat/${subDir}`;
    if (!existsSync(dirPath)) {
      mkdirSync(dirPath, { recursive: true });
    }
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    httpsOptions: {
      key: readFileSync('/app/ssl/key.pem'),
      cert: readFileSync('/app/ssl/cert.pem'),
    },
  });

  app.use(helmet());
  app.use(cookieParser());

  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));

  app.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Serve uploaded files statically at /uploads
  app.useStaticAssets('/app/uploads', { prefix: '/uploads/' });

  app.useGlobalInterceptors(new XssInterceptor());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      stopAtFirstError: true,
    }),
  );

  app.useGlobalInterceptors(new MetricsInterceptor());

  await app.listen(3000,'0.0.0.0');
}
bootstrap();
