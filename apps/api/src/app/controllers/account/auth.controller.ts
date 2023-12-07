import { Body, Controller, Get, HttpCode, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AccountLogin, AccountRefresh, AccountRegister, AccountRegisterMany, AccountSetPassword } from '@myhome/contracts';
import { RMQService } from 'nestjs-rmq';
import { CatchError } from '../../error.filter';
import { JWTAuthGuard } from '../../guards/jwt.guard';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { RefreshAuthGuard } from '../../guards/refresh.guard';
import { RegisterDto, LoginDto, SetPasswordDto, RegisterManyDto } from '../../dtos/account/account.dto';
import { IJWTPayload, UserRole } from '@myhome/interfaces';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly rmqService: RMQService,
    private readonly configService: ConfigService
  ) { }

  @HttpCode(201)
  @UseGuards(JWTAuthGuard)
  @Post('register')
  async register(@Req() req: { user: IJWTPayload }, @Body() dto: RegisterDto) {
    try {
      return await this.rmqService.send<
        AccountRegister.Request,
        AccountRegister.Response
      >(AccountRegister.topic, { ...dto, registerRole: req.user.userRole });
    } catch (e) {
      CatchError(e);
    }
  }

  @HttpCode(201)
  @UseGuards(JWTAuthGuard)
  @Post('register-many')
  async registerMany(@Req() req: { user: IJWTPayload }, @Body() dto: RegisterManyDto) {
    try {
      return await this.rmqService.send<
        AccountRegisterMany.Request,
        AccountRegisterMany.Response
      >(AccountRegisterMany.topic, { ...dto, registerRole: req.user.userRole });
    } catch (e) {
      CatchError(e);
    }
  }

  @HttpCode(200)
  @Post('set-password')
  async setPassword(@Body() dto: SetPasswordDto) {
    try {
      return await this.rmqService.send<
        AccountSetPassword.Request,
        AccountSetPassword.Response
      >(AccountSetPassword.topic, dto);
    } catch (e) {
      CatchError(e);
    }
  }

  @HttpCode(200)
  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    try {
      const { token, refreshToken, userId, userRole } = await this.rmqService.send<
        AccountLogin.Request,
        AccountLogin.Response
      >(AccountLogin.topic, dto);

      this.setCookie(res, token, refreshToken, { userId, userRole });

      return { msg: "success" };
    } catch (e) {
      CatchError(e);
    }
  }

  @HttpCode(200)
  @Get('refresh')
  @UseGuards(RefreshAuthGuard)
  async regenerateTokens(@Req() req: { user: IJWTPayload }, @Res({ passthrough: true }) res: Response) {
    try {
      const { token } = await this.rmqService.send<
        AccountRefresh.Request,
        AccountRefresh.Response
      >(AccountRefresh.topic, req.user);

      this.setCookie(res, token);

      return { msg: "success" };
    } catch (e) {
      CatchError(e);
    }
  }

  @HttpCode(200)
  @Get('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    try {
      this.removeCookie(res);
      return { msg: "success" };
    } catch (e) {
      CatchError(e);
    }
  }

  public getExpires() {
    const hour = 3600000;

    const now = Date.now();
    const expires = new Date(now + hour * parseInt(this.configService.get("EXPIRE_JWT")));
    const expiresRefresh = new Date(now + hour * parseInt(this.configService.get("EXPIRE_REFRESH")));

    return { expires, expiresRefresh };
  }

  private setCookie(res: Response,
    token: string,
    refreshToken?: string,
    user?: { userId: number; userRole: UserRole },
  ) {
    const { expires, expiresRefresh } = this.getExpires();

    res.cookie('token', token, {
      httpOnly: true,
      expires: expires
    });
    if (user) {
      res.cookie('userId', String(user.userId), {
        expires: expiresRefresh
      });
      res.cookie('userRole', user.userRole, {
        expires: expiresRefresh,
      });
    }
    if (refreshToken) {
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        expires: expiresRefresh
      });
    }
  }

  private removeCookie(res: Response) {
    res.cookie('token', "", {
      httpOnly: true,
      expires: new Date(0),
    });
    res.cookie('userId', 0, {
      expires: new Date(0),
    });
    res.cookie('userRole', "None", {
      expires: new Date(0),
    });
    res.cookie('refreshToken', "", {
      httpOnly: true,
      expires: new Date(0),
    });
  }
}