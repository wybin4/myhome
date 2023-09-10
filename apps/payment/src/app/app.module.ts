import { Module } from '@nestjs/common';
import { PaymentModule } from './payment/payment.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RMQModule } from 'nestjs-rmq';
import { getMySQLConfig } from './configs/mysql.config';
import { getRMQConfig } from './configs/rmq.config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: 'envs/.payment.env' }),
    RMQModule.forRootAsync(getRMQConfig()),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => getMySQLConfig(configService),
      inject: [ConfigService],
    }),
    PaymentModule
  ],
})
export class AppModule { }
