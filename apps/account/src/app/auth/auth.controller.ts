import { Body, Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AccountRegister } from '@myhome/contracts';
import { RMQError, RMQRoute, RMQValidate } from 'nestjs-rmq';
import { ERROR_TYPE } from 'nestjs-rmq/dist/constants';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @RMQValidate()
  @RMQRoute(AccountRegister.topic)
  async register(@Body() dto: AccountRegister.Request) {
    try {
      return await this.authService.register(dto);
    } catch (e) {
      throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
    }
  }

  // @RMQValidate()
  // @RMQRoute(AccountLogin.topic)
  // async login(@Body() { email, password, role }: AccountLogin.Request): Promise<AccountLogin.Response> {
  //   const { id } = await this.authService.validateUser(email, password, role);
  //   return this.authService.login(id);
  // }
}
