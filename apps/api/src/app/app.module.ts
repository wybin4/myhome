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
import { AppealController } from './controllers/event/appeal.controller';
import { HouseNotificationController } from './controllers/event/notification/house-notification.controller';
import { SinglePaymentDocumentController } from './controllers/single-payment-document/single-payment-document.controller';
import { PenaltyController } from './controllers/correction/penalty.controller';
import { VotingController } from './controllers/event/voting.controller';
import { CBRController } from './controllers/correction/cbr.controller';
import { ServiceNotificationController } from './controllers/event/notification/service-notification.controller';
import { SocketGateway } from './socket.gateway';
import { ChatController } from './controllers/chat/chat.controller';
import { EventController } from './controllers/event/event.controller';
import { CommonController } from './controllers/reference/common.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshStrategy } from './strategies/refresh.strategy';

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
      HouseNotificationController,
      ServiceNotificationController,
      SinglePaymentDocumentController,
      PenaltyController,
      VotingController,
      CBRController,
      ChatController,
      EventController,
      CommonController
    ],
  providers: [SocketGateway, JwtStrategy, RefreshStrategy]
})
export class AppModule { }
