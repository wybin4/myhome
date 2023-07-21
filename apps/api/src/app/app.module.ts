import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { ConfigModule } from '@nestjs/config';
import { getRMQConfig } from './configs/rmq.config';
import { RMQModule } from 'nestjs-rmq';
import { JwtModule } from '@nestjs/jwt';
import { getJWTConfig } from './configs/jwt.config';
import { PassportModule } from '@nestjs/passport';
import { UserController } from './controllers/user.controller';
import { HouseController } from './controllers/house.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: 'envs/.api.env', isGlobal: true }),
    RMQModule.forRootAsync(getRMQConfig()),
    JwtModule.registerAsync(getJWTConfig()),
    PassportModule,
  ],
  controllers: [AuthController, UserController, HouseController],
})
export class AppModule {}
