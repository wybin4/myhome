import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RMQModule } from 'nestjs-rmq';
import { getRMQConfig } from './configs/rmq.config';
import { getMySQLConfig } from './configs/mysql.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SinglePaymentDocumentModule } from './single-payment-document/single-payment-document.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: 'envs/.single-payment-document.env' }),
    RMQModule.forRootAsync(getRMQConfig()),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => getMySQLConfig(configService),
      inject: [ConfigService],
    }),
    SinglePaymentDocumentModule
  ],
})
export class AppModule { }
