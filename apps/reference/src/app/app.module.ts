import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RMQModule } from 'nestjs-rmq';
import { getRMQConfig } from './configs/rmq.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getMySQLConfig } from './configs/mysql.config';
import { SubscriberModule } from './subscriber/subscriber.module';
import { MeterModule } from './meter/meter.module';
import { CommonModule } from './common/common.module';
import { TariffAndNormModule } from './tariff-and-norm/tariff-and-norm.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: 'envs/.reference.env' }),
    RMQModule.forRootAsync(getRMQConfig()),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => getMySQLConfig(configService),
      inject: [ConfigService],
    }),
    SubscriberModule,
    MeterModule,
    CommonModule,
    TariffAndNormModule
  ],
})
export class AppModule { }
