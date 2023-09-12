import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { getRMQConfig } from './configs/rmq.config';
import { RMQModule } from 'nestjs-rmq';
import { JwtModule } from '@nestjs/jwt';
import { getJWTConfig } from './configs/jwt.config';
import { PassportModule } from '@nestjs/passport';
import { UserController } from './controllers/account/user.controller';
import { ApartmentController } from './controllers/reference/apartment.controller';
import { HouseController } from './controllers/reference/house.controller';
import { MeterController } from './controllers/reference/meter.controller';
import { SubscriberController } from './controllers/reference/subscriber.controller';
import { AuthController } from './controllers/account/auth.controller';
import { TariffAndNormController } from './controllers/reference/tariff-and-norm.controller';
import { AppealController } from './controllers/appeal/appeal.controller';
import { NotificationController } from './controllers/notification/notification.controller';
import { SinglePaymentDocumentController } from './controllers/single-payment-document/single-payment-document.controller';
import { PenaltyController } from './controllers/correction/penalty.controller';
import { VotingController } from './controllers/voting/voting.controller';

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
      MeterController,
      TariffAndNormController,
      AppealController,
      NotificationController,
      SinglePaymentDocumentController,
      PenaltyController,
      VotingController
    ],
})
export class AppModule { }
