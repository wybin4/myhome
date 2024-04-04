import { JwtService } from "@nestjs/jwt";
import * as cookie from 'cookie';
import { Socket } from "socket.io";
import { RMQService } from "nestjs-rmq";
import { AccountRefresh } from "@myhome/contracts";
import { IJWTPayload, UserRole } from "@myhome/interfaces";
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
            // const cookies = parseCookies(socket.handshake.headers.cookie);
            // const token = cookies['token'];
            // if (token) {
            //     const jwtPayload = jwtService.verify(
            //         token ?? '',
            //     );
            //     setKey(jwtPayload, socket);
            //     next();
            // } else {
            //     const refresh = cookies["refreshToken"];
            //     if (refresh) {
            //         const jwtRefreshPayload = jwtService.verify(
            //             refresh ?? '',
            //         );

            //         const { userId, userRole } = jwtRefreshPayload;
            //         const { token: newJWT } = await rmqService.send<
            //             AccountRefresh.Request,
            //             AccountRefresh.Response
            //         >(AccountRefresh.topic, { userId, userRole });

            //         setKey(jwtRefreshPayload, socket);

            //         socket.conn.transport.once('headers', (headers) => {
            //             const { expiresRefresh } = authController.getExpires();
            //             const newCookie = cookie.serialize('token', newJWT, {
            //                 httpOnly: true,
            //                 expires: expiresRefresh,
            //             });

            //             headers['set-cookie'] = newCookie;
            //             next();
            //         });
            //     } else {
            //         next({
            //             name: 'Unauthorizaed',
            //             message: 'Unauthorizaed',
            //         });
            //     }
            // }
            const key = `1_Owner`;
            clients.set(key, socket);
            socket.data.user = { userId: 1, userRole: UserRole.Owner };
            next();
        } catch (error) {
            next({
                name: 'Unauthorizaed',
                message: 'Unauthorizaed',
            });
        }
    }

    // function setKey(user: IJWTPayload, socket: Socket) {
    //     const { userId, userRole } = user;
    //     socket.data.user = { userId, userRole };
    //     const key = `${userId}_${userRole}`;
    //     clients.set(key, socket);
    // }

    // function parseCookies(cookiesString?: string): Record<string, string> {
    //     return cookie.parse(cookiesString || '');
    // }
}