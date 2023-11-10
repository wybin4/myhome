import { Body, Controller, HttpCode, Post/*, UseGuards*/ } from '@nestjs/common';
// import { JWTAuthGuard } from '../guards/jwt.guard';
import { RMQService } from 'nestjs-rmq';
import { AccountGetUsersByAnotherRole, AccountUserInfo } from '@myhome/contracts';
import { GetUsersByAnotherRoleDto, UserInfoDto } from '../../dtos/account/user.dto';
import { CatchError } from '../../error.filter';

@Controller('user')
export class UserController {
  constructor(
    private readonly rmqService: RMQService
  ) { }

  // @UseGuards(JWTAuthGuard)
  @HttpCode(200)
  @Post('info')
  async info(@Body() dto: UserInfoDto) {
    try {
      return await this.rmqService.send<
        AccountUserInfo.Request,
        AccountUserInfo.Response
      >(AccountUserInfo.topic, dto);
    } catch (e) {
      CatchError(e);
    }
  }

  @HttpCode(200)
  @Post('get-users-by-another-role')
  async getOwnersByMCId(@Body() dto: GetUsersByAnotherRoleDto) {
    try {
      return await this.rmqService.send<
        AccountGetUsersByAnotherRole.Request,
        AccountGetUsersByAnotherRole.Response
      >(AccountGetUsersByAnotherRole.topic, dto);
    } catch (e) {
      CatchError(e);
    }
  }
}
