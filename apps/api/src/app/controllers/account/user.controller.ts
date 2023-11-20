import { Body, Controller, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { RMQService } from 'nestjs-rmq';
import { AccountGetAllUsers, AccountGetUsersByAnotherRole, AccountUserInfo } from '@myhome/contracts';
import { GetAllUsersDto, GetUsersByAnotherRoleDto, UserInfoDto } from '../../dtos/account/user.dto';
import { CatchError } from '../../error.filter';
import { JWTAuthGuard } from '../../guards/jwt.guard';

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

  @UseGuards(JWTAuthGuard)
  @HttpCode(200)
  @Post('get-all-users')
  async getAllUsers(
    @Req() req,
    @Body() dto: GetAllUsersDto
  ) {
    try {
      return await this.rmqService.send<
        AccountGetAllUsers.Request,
        AccountGetAllUsers.Response
      >(AccountGetAllUsers.topic, {
        userRole: dto.userRole,
        requesterRole: req.user.userRole
      });
    } catch (e) {
      CatchError(e);
    }
  }

  @UseGuards(JWTAuthGuard)
  @HttpCode(200)
  @Post('get-users-by-another-role')
  async getOwnersByMCId(
    @Req() req,
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
