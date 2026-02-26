import 'reflect-metadata'
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

async function bootstrap() {
  // Ensure uploads directories exist (one per file type)
  const uploadSubDirs = ['images', 'videos', 'audio', 'documents'];
  for (const subDir of uploadSubDirs) {
    const dirPath = `/app/uploads/chat/${subDir}`;
    if (!existsSync(dirPath)) {
      mkdirSync(dirPath, { recursive: true });
    }
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  
  app.enableCors({
    origin: true, 
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Serve uploaded files statically at /uploads
  app.useStaticAssets('/app/uploads', { prefix: '/uploads/' });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      stopAtFirstError: true,
    }),
  );
  await app.listen(3000, "0.0.0.0");
}
bootstrap();
