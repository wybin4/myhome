import { JwtService } from "@nestjs/jwt";
import * as cookie from 'cookie';
import { Socket } from "socket.io";
import { RMQService } from "nestjs-rmq";
import { AccountRefresh } from "@myhome/contracts";
import { IJWTPayload } from "@myhome/interfaces";
import { AuthController } from "./controllers/account/auth.controller";

export type SocketMiddleware = (socket: Socket, next: (err?: Error) => void) => void
export const WSAuthMiddleware = (
    jwtService: JwtService,
    clients: Map<string, Socket>,
    rmqService: RMQService,
    authController: AuthController
): SocketMiddleware => {
    return async (socket: Socket, next) => {
        try {
            const cookies = parseCookies(socket.handshake.headers.cookie);
            const tokenFromCookie = cookies['token'];
            const tokenFromHeader = socket.handshake.headers['authorization'];

            let token: string | undefined;

            if (tokenFromCookie) {
                token = tokenFromCookie;
            } else if (tokenFromHeader && tokenFromHeader.startsWith('Bearer ')) {
                token = tokenFromHeader.split(' ')[1];
            }
            if (token) {
                const jwtPayload = jwtService.verify(
                    token ?? '',
                );
                setKey(jwtPayload, socket);
                next();
            } else {
                const refreshTokenFromCookie = cookies['refreshToken'];
                const refreshTokenFromHeader = socket.handshake.headers['authorization'];

                let refreshToken: string | undefined;

                if (refreshTokenFromCookie) {
                    refreshToken = refreshTokenFromCookie;
                } else if (refreshTokenFromHeader && refreshTokenFromHeader.startsWith('Bearer ')) {
                    refreshToken = refreshTokenFromHeader.split(' ')[1];
                }
                if (refreshToken) {
                    const jwtRefreshPayload = jwtService.verify(
                        refreshToken ?? '',
                    );

                    const { userId, userRole } = jwtRefreshPayload;
                    const { token: newJWT } = await rmqService.send<
                        AccountRefresh.Request,
                        AccountRefresh.Response
                    >(AccountRefresh.topic, { userId, userRole });

                    setKey(jwtRefreshPayload, socket);

                    socket.conn.transport.once('headers', (headers) => {
                        const { expiresRefresh } = authController.getExpires();
                        const newCookie = cookie.serialize('token', newJWT, {
                            httpOnly: true,
                            expires: expiresRefresh,
                        });

                        headers['set-cookie'] = newCookie;
                        headers['Authorization'] = `Bearer ${newJWT}`;
                        next();
                    });
                } else {
                    next({
                        name: 'Unauthorizaed',
                        message: 'Unauthorizaed',
                    });
                }
            }
        } catch (error) {
            next({
                name: 'Unauthorizaed',
                message: 'Unauthorizaed',
            });
        }
    }

    function setKey(user: IJWTPayload, socket: Socket) {
        const { userId, userRole } = user;
        socket.data.user = { userId, userRole };
        const key = `${userId}_${userRole}`;
        clients.set(key, socket);
    }

    function parseCookies(cookiesString?: string): Record<string, string> {
        return cookie.parse(cookiesString || '');
    }
}