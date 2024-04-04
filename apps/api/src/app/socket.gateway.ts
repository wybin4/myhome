import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { RMQService } from "nestjs-rmq";
import { Injectable } from "@nestjs/common";
import { GetChats, EventGetUnreadServiceNotifications, AddMessage, ReadMessages, AddChat, EventUpdateAllServiceNotifications, EventAddServiceNotifications, EventAddServiceNotification } from "@myhome/contracts";
import { Server, Socket } from "socket.io";
import { WSAuthMiddleware } from "./ws.middleware";
import { JwtService } from "@nestjs/jwt";
import { AuthController } from "./controllers/account/auth.controller";

@Injectable()
@WebSocketGateway({
    cors: {
        origin: true,
        credentials: true,
    },
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
    constructor(
        private readonly rmqService: RMQService,
        private readonly jwtService: JwtService,
        private readonly authController: AuthController
    ) { }

    @WebSocketServer()
    server: Server;
    private clients = new Map<string, Socket>();

    afterInit() {
        const middle = WSAuthMiddleware(
            this.jwtService,
            this.clients,
            this.rmqService,
            this.authController
        );
        this.server.use(middle);
    }

    async handleConnection(socket: Socket) {
        this.hasUnreadNotifications(socket);
        this.getChats(socket);
    }

    async hasUnreadNotifications(socket: Socket) {
        try {
            const hasUnread = await this.rmqService.send<
                EventGetUnreadServiceNotifications.Request,
                EventGetUnreadServiceNotifications.Response
            >(EventGetUnreadServiceNotifications.topic, socket.data.user);
            socket.emit('hasUnreadNotifications', hasUnread.hasUnreadNotifications);
        } catch (e) {
            socket.emit('hasUnreadNotifications', { message: "Ошибка при получении уведомлений" });
        }
    }

    async setUnreadNotifications(dto: EventUpdateAllServiceNotifications.Response) {
        const key = `${dto.userId}_${dto.userRole}`;
        const socket = this.clients.get(key);
        if (socket) {
            socket.emit('hasUnreadNotifications', 0);
        }
    }

    async getChats(socket: Socket) {
        try {
            const chats = await this.rmqService.send<
                GetChats.Request,
                GetChats.Response
            >(GetChats.topic, socket.data.user);
            socket.emit('chats', chats);
        } catch (e) {
            socket.emit('chats', { message: "Ошибка при получении чатов" });
        }
    }

    sendNotificationToClient(dto: EventAddServiceNotification.Response) {
        const key = `${dto.notification.userId}_${dto.notification.userRole}`;
        const socket = this.clients.get(key);
        if (socket) {
            socket.emit('newNotification', dto.notification);
            socket.emit('hasUnreadNotifications', 1);
        }
    }

    sendNotificationsToClients(dto: EventAddServiceNotifications.Response) {
        dto.notifications.map(notification => {
            const key = `${notification.userId}_${notification.userRole}`;
            const socket = this.clients.get(key);
            if (socket) {
                socket.emit('newNotification', notification);
                socket.emit('hasUnreadNotifications', 1);
            }
        })
    }

    sendMessageToClients(dto: AddMessage.Response) {
        dto.users.map(user => {
            const key = `${user.userId}_${user.userRole}`;
            const socket = this.clients.get(key);
            if (socket) {
                socket.emit('newMessage', {
                    createdMessage: dto.createdMessage,
                    updatedMessages: dto.updatedMessages
                });
            }
        })
    }

    sendMessagesToClients(dto: ReadMessages.Response) {
        dto.users.map(user => {
            const key = `${user.userId}_${user.userRole}`;
            const socket = this.clients.get(key);
            if (socket) {
                socket.emit('readMessages', {
                    chatId: dto.chatId,
                    messages: dto.messages
                });
            }
        })
    }

    sendChatToClients(dto: AddChat.Response) {
        dto.chat.users.map(user => {
            const key = `${user.userId}_${user.userRole}`;
            const socket = this.clients.get(key);
            if (socket) {
                socket.emit('newChat', dto.chat);
            }
        })
    }

    handleDisconnect(socket: Socket) {
        const key = `${socket.data.user.userId}_${socket.data.user.userRole}`;
        this.clients.delete(key);
    }

}