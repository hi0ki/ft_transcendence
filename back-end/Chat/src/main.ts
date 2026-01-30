// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);
//   await app.listen(3001, '0.0.0.0');
// }
// bootstrap();



import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Enable CORS for HTTP requests
  app.enableCors({
    origin: 'http://localhost:3001',
    credentials: true,
  });

  // Serve static files from src_client
  const staticPath = join(__dirname, '..', 'src_client');
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



// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);
  
//   // Activer CORS pour permettre les connexions depuis React
//   app.enableCors({
//     origin: 'http://localhost:3001',
//     credentials: true,
//   });
  
//   await app.listen(3001);
// }
// bootstrap();
