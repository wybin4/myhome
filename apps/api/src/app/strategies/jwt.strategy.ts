import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserRole } from '@myhome/interfaces';
import { Request } from "express";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        JwtStrategy.extractJWT,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  private static extractJWT(req: Request): string | null {
    if (
      req.cookies &&
      'token' in req.cookies &&
      req.cookies['token'].length > 0
    ) {
      return req.cookies['token'];
    }
    return null;
  }

  async validate(payload: { id: number; userRole: UserRole }) {
    return {
      userId: payload.id,
      userRole: payload.userRole
    };
  }

}
