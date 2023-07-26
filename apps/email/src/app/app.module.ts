import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { getMailerConfig } from './email/configs/mailer.config';
import { getRMQConfig } from './email/configs/rmq.config';
import { RMQModule } from 'nestjs-rmq';
import { ConfigModule } from '@nestjs/config';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: 'envs/.email.env', isGlobal: true }),
    RMQModule.forRootAsync(getRMQConfig()),
    MailerModule.forRoot(getMailerConfig()),
    EmailModule
  ],
})
export class AppModule { }
