<<<<<<< HEAD:back-end/Chat/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Enable CORS for HTTP requests
  // Allow requests from browser (localhost:8080 via nginx) and direct access
  app.enableCors({
    origin: ['http://localhost:8080', 'http://localhost:5173', 'http://localhost:3001'],
    credentials: true,
  });

  // Serve static files from src_client/////////////////////////////////////////
  // const staticPath = join(__dirname, '..', 'src_client');
  // app.useStaticAssets(staticPath);

  // // Serve index.html for all unmatched routes
  // app.use((req, res, next) => {
  //   if (!req.path.startsWith('/api') && !req.path.includes('.')) {
  //     res.sendFile(join(staticPath, 'index.html'));
  //   } else {
  //     next();
  //   }
  // });

  // Serve static files from front-end
  const staticPath = join(__dirname, '../..', 'front-end/src/chat');
  app.useStaticAssets(staticPath);

  // Serve index.html for all unmatched routes
  app.use((req, res, next) => {
    if (!req.path.startsWith('/api') && !req.path.includes('.')) {
      res.sendFile(join(staticPath, 'index.html'));
    } else {
      next();
    }
  });
  await app.listen(3001, '0.0.0.0');
}

bootstrap();
=======
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000, '0.0.0.0');
}
bootstrap();
>>>>>>> master:backend/back-end/Chat/src/main.ts
