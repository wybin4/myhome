import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { ConfigModule } from '@nestjs/config';
import { getRMQConfig } from './configs/rmq.config';
import { RMQModule } from 'nestjs-rmq';
import { JwtModule } from '@nestjs/jwt';
import { getJWTConfig } from './configs/jwt.config';
import { PassportModule } from '@nestjs/passport';
import { UserController } from './controllers/account/user.controller';
import { HouseController } from './controllers/house.controller';
import { ApartmentController } from './controllers/reference/apartment.controller';
import { SubscriberController } from './controllers/subscriber.controller';
import { MeterController } from './controllers/meter.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: 'envs/.api.env', isGlobal: true }),
    RMQModule.forRootAsync(getRMQConfig()),
    JwtModule.registerAsync(getJWTConfig()),
    PassportModule,
  ],
  controllers:
    [
      AuthController, UserController,
      HouseController, ApartmentController, SubscriberController,
      MeterController
    ],
})
export class AppModule { }
