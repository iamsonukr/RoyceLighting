import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as morgan from 'morgan';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );

  // Morgan Custom Logger
  morgan.token('dateTime', () => {
    return new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
    });
  });

  app.use(
    morgan(
      '[:dateTime] :method :url :status :response-time ms - :res[content-length]',
    ),
  );

  app.enableCors({
    origin: [
      process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3000',
      process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3002',
      process.env.NEXT_PUBLIC_VENDOR_URL || 'http://localhost:3003',
      process.env.NEXT_PUBLIC_VENDOR_URL || 'http://localhost:3001',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'token'],
  });

  // Serve uploaded files statically
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads',
  });

  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(
    `🚀 Royce Lighting API running on http://localhost:${port}/api`,
  );
}

bootstrap();