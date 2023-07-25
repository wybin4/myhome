import { Body, Controller, Post } from '@nestjs/common';
import { AccountLogin, AccountRegister } from '@myhome/contracts';
import { RMQService } from 'nestjs-rmq';
import { LoginDto } from '../../dtos/account/login.dto';
import { RegisterDto } from '../../dtos/account/register.dto';
import { CatchError } from '../../error.filter';

@Controller('auth')
export class AuthController {
  constructor(private readonly rmqService: RMQService) { }

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    try {
      return await this.rmqService.send<
        AccountRegister.Request,
        AccountRegister.Response
      >(AccountRegister.topic, dto);
    } catch (e) {
      CatchError(e);
    }
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    try {
      return await this.rmqService.send<
        AccountLogin.Request,
        AccountLogin.Response
      >(AccountLogin.topic, dto);
    } catch (e) {
      CatchError(e);
    }
  }
}
