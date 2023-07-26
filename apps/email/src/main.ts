/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { ConfigService } from '@nestjs/config';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'email';
  app.setGlobalPrefix(globalPrefix);
  const port = new ConfigService().get('SERVICE_PORT');
  await app.listen(port);
  Logger.log(
    `🚀 Email is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
