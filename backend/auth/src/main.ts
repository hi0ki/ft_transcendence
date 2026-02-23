<<<<<<< HEAD
import 'reflect-metadata'
=======
>>>>>>> origin/master
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
<<<<<<< HEAD
  // app.useGlobalPipes(new ValidationPipe());
  app.useGlobalPipes
  (
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true, }),
=======

  // Enable CORS for frontend
  app.enableCors({
    origin: ['http://localhost:8080', 'http://localhost:5173', 'http://localhost:3001'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      stopAtFirstError: true,
    }),
>>>>>>> origin/master
  );
  await app.listen(3000, "0.0.0.0");
}
bootstrap();

