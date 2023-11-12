import { IJWTPayload } from "@myhome/interfaces";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
    constructor(configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                RefreshStrategy.extractJWT,
                ExtractJwt.fromAuthHeaderAsBearerToken(),
            ]),
            ignoreExpiration: false,
            secretOrKey: configService.get('JWT_SECRET'),
        });
    }

    private static extractJWT(req: Request): string | null {
        if (
            req.cookies &&
            'refreshToken' in req.cookies &&
            req.cookies['refreshToken'].length > 0
        ) {
            return req.cookies['refreshToken'];
        }
        return null;
    }

    async validate(payload: IJWTPayload) {
        return { ...payload };
    }
}