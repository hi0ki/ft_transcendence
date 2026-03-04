import { NestFactory } from '@nestjs/core';
import { ChatModule } from './chat.module';
import { readFileSync } from 'fs';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const httpsOptions = {
    key: readFileSync('/app/ssl/key.pem'),
    cert: readFileSync('/app/ssl/cert.pem'),
  };

  const app = await NestFactory.create(ChatModule, {
    httpsOptions,
  });

  // Configure Socket.IO to use the HTTPS server
  app.useWebSocketAdapter(new IoAdapter(app));

  // Enable CORS for HTTP requests
  app.enableCors({
    origin: ['https://localhost', 'http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  });

  await app.listen(3000, '0.0.0.0');
  console.log('Chat service is running on https://localhost:3000');
}

bootstrap();
