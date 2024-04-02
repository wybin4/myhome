/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { json, urlencoded } from 'express';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(cookieParser());

  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ limit: '50mb', extended: true }));
  
  app.useStaticAssets('./uploads', { prefix: '/api/image' });

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  const configService = new ConfigService();
  app.enableCors({
    credentials: true,
    origin: configService.get("CLIENT_URL")
  });
  const port = configService.get('SERVICE_PORT');
  await app.listen(port);
  Logger.log(
    `🚀 API is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
