import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RMQModule } from 'nestjs-rmq';
import { getRMQConfig } from './configs/rmq.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getMySQLConfig } from './configs/mysql.config';
import { SubscriberModule } from './subscriber/subscriber.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: 'envs/.reference.env' }),
    RMQModule.forRootAsync(getRMQConfig()),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => getMySQLConfig(configService),
      inject: [ConfigService],
    }),
    SubscriberModule,
  ],
})
export class AppModule { }
