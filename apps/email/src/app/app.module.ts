import { Module } from '@nestjs/common';
import { getRMQConfig } from './email/configs/rmq.config';
import { RMQModule } from 'nestjs-rmq';
import { ConfigModule } from '@nestjs/config';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: 'envs/.email.env', isGlobal: true }),
    RMQModule.forRootAsync(getRMQConfig()),
    EmailModule
  ],
})
export class AppModule { }
