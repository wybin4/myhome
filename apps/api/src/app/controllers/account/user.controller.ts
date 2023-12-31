import { Body, Controller, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { RMQService } from 'nestjs-rmq';
import { AccountGetAllUsers, AccountGetUsersByAnotherRole, AccountUserInfo } from '@myhome/contracts';
import { GetAllUsersDto, GetUsersByAnotherRoleDto, UserInfoDto } from '../../dtos/account/user.dto';
import { CatchError } from '../../error.filter';
import { JWTAuthGuard } from '../../guards/jwt.guard';
import { IJWTPayload } from '@myhome/interfaces';

@Controller('user')
export class UserController {
  constructor(
    private readonly rmqService: RMQService
  ) { }

  @UseGuards(JWTAuthGuard)
  @HttpCode(200)
  @Post('info')
  async info(@Req() req: { user: IJWTPayload }, @Body() dto: UserInfoDto) {
    try {
      return await this.rmqService.send<
        AccountUserInfo.Request,
        AccountUserInfo.Response
      >(AccountUserInfo.topic, { ...dto, ...req.user });
    } catch (e) {
      CatchError(e);
    }
  }

  @UseGuards(JWTAuthGuard)
  @HttpCode(200)
  @Post('get-all-users')
  async getAllUsers(
    @Req() req: { user: IJWTPayload },
    @Body() dto: GetAllUsersDto
  ) {
    try {
      return await this.rmqService.send<
        AccountGetAllUsers.Request,
        AccountGetAllUsers.Response
      >(AccountGetAllUsers.topic, {
        requesterRole: req.user.userRole,
        ...dto
      });
    } catch (e) {
      CatchError(e);
    }
  }

  @UseGuards(JWTAuthGuard)
  @HttpCode(200)
  @Post('get-users-by-another-role')
  async getOwnersByMCId(
    @Req() req: { user: IJWTPayload },
    @Body() dto: GetUsersByAnotherRoleDto
  ) {
    try {
      return await this.rmqService.send<
        AccountGetUsersByAnotherRole.Request,
        AccountGetUsersByAnotherRole.Response
      >(AccountGetUsersByAnotherRole.topic, { ...dto, ...req.user });
    } catch (e) {
      CatchError(e);
    }
  }
}
