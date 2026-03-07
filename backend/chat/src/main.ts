import { NestFactory } from '@nestjs/core';
import { ChatModule } from './chat.module';
import { readFileSync } from 'fs';
import { IoAdapter } from '@nestjs/platform-socket.io';
import * as cookieParser from 'cookie-parser';  
async function bootstrap() {
  const httpsOptions = {
    key: readFileSync('/app/ssl/key.pem'),
    cert: readFileSync('/app/ssl/cert.pem'),
  };

  const app = await NestFactory.create(ChatModule, {
    httpsOptions,
  });
  app.use(cookieParser()); 

  // Configure Socket.IO to use the HTTPS server
  app.useWebSocketAdapter(new IoAdapter(app));

  // Enable CORS for HTTP requests
  app.enableCors({
    origin: ['https://localhost'],
    credentials: true,
  });

  await app.listen(3000);
}

bootstrap();
