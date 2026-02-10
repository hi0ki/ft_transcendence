import { NestFactory } from '@nestjs/core';
import { AppModule } from './chat.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for HTTP requests
  app.enableCors({
    origin: ['http://localhost:8080', 'http://localhost:5173', 'http://localhost:3001'],
    credentials: true,
  });

  await app.listen(3000, '0.0.0.0');
  console.log('Chat service is running on http://localhost:3000');
}

bootstrap();
