import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RMQModule } from 'nestjs-rmq';
import { getRMQConfig } from './configs/rmq.config';
import { getMySQLConfig } from './configs/mysql.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DebtModule } from './debt/debt.module';
import { DepositModule } from './deposit/deposit.module';
import { MongooseModule } from '@nestjs/mongoose';
import { getMongoConfig } from './configs/mongo.config';
import { CorrectionService } from './correction.service';
import { CorrectionController } from './correction.controller';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: 'envs/.correction.env' }),
    RMQModule.forRootAsync(getRMQConfig()),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => getMySQLConfig(configService),
      inject: [ConfigService],
    }),
    MongooseModule.forRootAsync(getMongoConfig()),
    ScheduleModule.forRoot(),
    DebtModule,
    DepositModule
  ],
  providers: [CorrectionService],
  controllers: [CorrectionController],
})
export class AppModule { }
