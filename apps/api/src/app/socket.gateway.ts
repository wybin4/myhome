import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { RMQService } from "nestjs-rmq";
import { IGetChat, IGetMessage, IServiceNotification, UserRole } from "@myhome/interfaces";
import { Injectable } from "@nestjs/common";
import { AppealGetChats, GetServiceNotifications } from "@myhome/contracts";
import { Server, Socket } from "socket.io";

@Injectable()
@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
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
        this.getNotifications(socket, userId, userRole);
        this.getChats(socket, userId, userRole);
    }

    async getNotifications(socket: Socket, userId: number, userRole: UserRole) {
        try {
            const notifications = await this.rmqService.send<
                GetServiceNotifications.Request,
                GetServiceNotifications.Response
            >(GetServiceNotifications.topic, { userId, userRole });
            socket.emit('notifications', notifications);
        } catch (e) {
            socket.emit('notifications', { message: "Ошибка при получении уведомлений" });
        }
    }

    async getChats(socket: Socket, userId: number, userRole: UserRole) {
        try {
            const chats = await this.rmqService.send<
                AppealGetChats.Request,
                AppealGetChats.Response
            >(AppealGetChats.topic, { userId, userRole });
            socket.emit('chats', chats);
        } catch (e) {
            socket.emit('chats', { message: "Ошибка при получении чатов" });
        }
    }

    sendNotificationToClients(notification: IServiceNotification) {
        const key = `${notification.userId}_${notification.userRole}`;
        const socket = this.clients.get(key);
        if (socket) {
            socket.emit('newNotification', notification);
        }
    }

    sendNotificationsToClients(notifications: IServiceNotification[]) {
        notifications.map(notification => {
            const key = `${notification.userId}_${notification.userRole}`;
            const socket = this.clients.get(key);
            if (socket) {
                socket.emit('newNotification', notification);
            }
        })
    }

    sendMessageToClients(message: IGetMessage) {
        const key = `${message.userId}_${message.userRole}`;
        const socket = this.clients.get(key);
        if (socket) {
            socket.emit('newMessage', message);
        }
    }

    sendChatToClients(chat: IGetChat) {
        const key = `${chat.userId}_${chat.userRole}`;
        const socket = this.clients.get(key);
        if (socket) {
            socket.emit('newChat', chat);
        }
    }

    handleDisconnect(socket: Socket) {
        const key = `${socket.data.user.userId}_${socket.data.user.userRole}`;
        this.clients.delete(key);
    }

}