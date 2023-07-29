import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RMQModule } from 'nestjs-rmq';
import { getRMQConfig } from './configs/rmq.config';
import { getMySQLConfig } from './configs/mysql.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: 'envs/.notification.env' }),
    RMQModule.forRootAsync(getRMQConfig()),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => getMySQLConfig(configService),
      inject: [ConfigService],
    }),
    NotificationModule
  ],
})
export class AppModule { }
