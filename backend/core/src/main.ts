import 'reflect-metadata'
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap()
{
	const app = await NestFactory.create(AppModule);
	
	
	app.enableCors({
		origin: true,
		credentials: true,
		methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization'],
	});
	
	app.useGlobalPipes(new ValidationPipe());
	await app.listen(3000, '0.0.0.0');
}
bootstrap();