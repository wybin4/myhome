import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AccountLogin, AccountRefresh, AccountRegister } from '@myhome/contracts';
import { RMQService } from 'nestjs-rmq';
import { CatchError } from '../../error.filter';
import { JWTAuthGuard } from '../../guards/jwt.guard';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { RefreshAuthGuard } from '../../guards/refresh.guard';
import { RegisterDto, LoginDto } from '../../dtos/account/account.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly rmqService: RMQService,
    private readonly configService: ConfigService
  ) { }

  @UseGuards(JWTAuthGuard)
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
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    try {
      const { token, refreshToken } = await this.rmqService.send<
        AccountLogin.Request,
        AccountLogin.Response
      >(AccountLogin.topic, dto);

      this.setCookie(res, token, refreshToken);

      return { msg: 'success' };
    } catch (e) {
      CatchError(e);
    }
  }

  @UseGuards(JWTAuthGuard)
  @Post('get')
  async get() {
    return "Привет!";
  }

  @Get('refresh')
  @UseGuards(RefreshAuthGuard)
  async regenerateTokens(@Req() req, @Res({ passthrough: true }) res: Response) {
    const { token } = await this.rmqService.send<
      AccountRefresh.Request,
      AccountRefresh.Response
    >(AccountRefresh.topic, req.user);

    this.setCookie(res, token);

    return { msg: 'success' };
  }

  private getExpires() {
    const hour = 3600000;

    const now = Date.now();
    const expires = new Date(now + hour * parseInt(this.configService.get("EXPIRE_JWT")));
    const expiresRefresh = new Date(now + hour * parseInt(this.configService.get("EXPIRE_REFRESH")));

    return { expires, expiresRefresh };
  }

  private setCookie(res: Response, token: string, refreshToken?: string) {
    const { expires, expiresRefresh } = this.getExpires();

    res.cookie('token', token, {
      httpOnly: true,
      expires: expires
    });
    if (refreshToken) {
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        expires: expiresRefresh
      });
    }
  }
}