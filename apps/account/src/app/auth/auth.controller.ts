import { Body, Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AccountLogin, AccountRefresh, AccountRegister } from '@myhome/contracts';
import { RMQError, RMQRoute, RMQValidate } from 'nestjs-rmq';
import { ERROR_TYPE } from 'nestjs-rmq/dist/constants';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @RMQValidate()
  @RMQRoute(AccountRegister.topic)
  async register(@Body() dto: AccountRegister.Request): Promise<AccountRegister.Response> {
    try {
      return await this.authService.register(dto);
    } catch (e) {
      throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
    }
  }

  @RMQValidate()
  @RMQRoute(AccountLogin.topic)
  async login(@Body() dto: AccountLogin.Request): Promise<AccountLogin.Response> {
    try {
      const user = await this.authService.validateUser(dto);
      return await this.authService.login(user);
    } catch (e) {
      throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
    }
  }

  @RMQValidate()
  @RMQRoute(AccountRefresh.topic)
  async refresh(@Body() dto: AccountRefresh.Request): Promise<AccountRefresh.Response> {
    try {
      return await this.authService.refresh(dto);
    } catch (e) {
      throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
    }
  }
}
