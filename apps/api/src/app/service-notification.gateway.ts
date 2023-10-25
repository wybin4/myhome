import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { RMQService } from "nestjs-rmq";
import { IServiceNotification, UserRole } from "@myhome/interfaces";
import { Injectable } from "@nestjs/common";
import { GetServiceNotifications } from "@myhome/contracts";
import { Server, Socket } from "socket.io";

@Injectable()
@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class ServiceNotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
    constructor(
        private rmqService: RMQService,
    ) { }

    @WebSocketServer()
    server: Server;
    private clients = new Map<string, Socket>();

    // @UseGuards(JwtGuard)
    async handleConnection(socket: Socket) {
        // const jwt = socket.handshake.headers.authorization || null;
        // this.authService.getJwtUser(jwt).subscribe((user: User) => {
        //     if (!user) {
        //         console.log('No USER');
        //         this.handleDisconnect(socket);
        //     } else {
        //         socket.data.user = user;
        //         this.getConversations(socket, user.id);
        //     }
        // });
        const userId = 1;
        const userRole = UserRole.Owner;
        socket.data.user = { userId, userRole };
        const key = `${userId}_${userRole}`;
        this.clients.set(key, socket);
        await this.getNotifications(socket, userId, userRole);
    }

    async getNotifications(socket: Socket, userId: number, userRole: UserRole) {
        const notifications = await this.rmqService.send<
            GetServiceNotifications.Request,
            GetServiceNotifications.Response
        >(GetServiceNotifications.topic, { userId, userRole });
        socket.emit('notifications', notifications);
    }

    sendNotificationToClients(
        notification: IServiceNotification
    ) {
        const key = `${notification.userId}_${notification.userRole}`;
        const socket = this.clients.get(key);
        if (socket) {
            socket.emit('newNotification', notification);
        }
    }

    handleDisconnect(socket: Socket) {
        const key = `${socket.data.user.userId}_${socket.data.user.userRole}`;
        this.clients.delete(key);
    }

}