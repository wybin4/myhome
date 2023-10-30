import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { RMQService } from "nestjs-rmq";
import { UserRole } from "@myhome/interfaces";
import { Injectable } from "@nestjs/common";
import { GetChats, EventGetServiceNotifications, AddMessage, ReadMessages, AddChat, EventAddServiceNotifications, EventUpdateServiceNotification, EventUpdateAllServiceNotifications } from "@myhome/contracts";
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
                EventGetServiceNotifications.Request,
                EventGetServiceNotifications.Response
            >(EventGetServiceNotifications.topic, { userId, userRole });
            socket.emit('notifications', notifications);
        } catch (e) {
            socket.emit('notifications', { message: "Ошибка при получении уведомлений" });
        }
    }

    async getChats(socket: Socket, userId: number, userRole: UserRole) {
        try {
            const chats = await this.rmqService.send<
                GetChats.Request,
                GetChats.Response
            >(GetChats.topic, { userId, userRole });
            socket.emit('chats', chats);
        } catch (e) {
            socket.emit('chats', { message: "Ошибка при получении чатов" });
        }
    }

    sendNotificationToClient(dto: EventUpdateServiceNotification.Response) {
        const key = `${dto.notification.userId}_${dto.notification.userRole}`;
        const socket = this.clients.get(key);
        if (socket) {
            socket.emit('readNotifications', [dto.notification]);
        }
    }

    sendNotificationsToClient(dto: EventUpdateAllServiceNotifications.Response) {
        const key = `${dto.userId}_${dto.userRole}`;
        const socket = this.clients.get(key);
        if (socket) {
            socket.emit('readNotifications', dto.notifications);
        }
    }

    sendNotificationsToClients(dto: EventAddServiceNotifications.Response) {
        dto.notifications.map(notification => {
            const key = `${notification.userId}_${notification.userRole}`;
            const socket = this.clients.get(key);
            if (socket) {
                socket.emit('newNotification', notification);
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