import 'reflect-metadata'
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';
import { readFileSync } from 'fs';
import * as cookieParser from 'cookie-parser';  

async function bootstrap()
{
	const app = await NestFactory.create(AppModule, {
		httpsOptions: {
			key: readFileSync('/app/ssl/key.pem'),
			cert: readFileSync('/app/ssl/cert.pem'),
		},
	});
	app.use(cookieParser()); 

	
	app.use(json({ limit: '10mb' }));
	app.use(urlencoded({ extended: true, limit: '10mb' }));
	
	
	app.enableCors({
		origin: true,
		credentials: true,
		methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization'],
	});
	
	app.useGlobalPipes(new ValidationPipe());
	await app.listen(3000);
}
bootstrap();