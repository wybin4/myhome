import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RMQModule } from 'nestjs-rmq';
import { getRMQConfig } from './configs/rmq.config';
import { getMySQLConfig } from './configs/mysql.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonHouseNeedModule } from './common-house-need/common-house-need.module';
import { DocumentDetailModule } from './document-detail/document-detail.module';
import { PublicUtilityModule } from './public-utility/public-utility.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: 'envs/.document-detail.env' }),
    RMQModule.forRootAsync(getRMQConfig()),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => getMySQLConfig(configService),
      inject: [ConfigService],
    }),
    DocumentDetailModule,
    CommonHouseNeedModule,
    PublicUtilityModule
  ],
})
export class AppModule { }
