/* eslint-disable no-empty */
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { RMQService } from "nestjs-rmq";
import { Injectable } from "@nestjs/common";
import { GetChats, EventGetUnreadServiceNotifications, AddMessage, AddChat, EventUpdateAllServiceNotifications, EventAddServiceNotifications, EventAddServiceNotification, ReadMessage } from "@myhome/contracts";
import { Server, Socket } from "socket.io";
import { WSAuthMiddleware } from "./ws.middleware";
import { JwtService } from "@nestjs/jwt";
import { AuthController } from "./controllers/account/auth.controller";
import { IChatUser, IGetChat } from "@myhome/interfaces";

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
        this.chats(socket);
    }

    @SubscribeMessage('addMessage')
    async handleAddMessage(@MessageBody() dto: string, @ConnectedSocket() socket: Socket) {
        try {
            const parsedDto = JSON.parse(dto);
            const newDto = await this.rmqService.send<
                AddMessage.Request,
                AddMessage.Response
            >(AddMessage.topic, { ...parsedDto, ...socket.data.user });
            this.sendNewMessage(newDto);
            this.sendUpdateChat(
                newDto.chat, newDto.users,
                (user) => socket.data.userId === user.userId
                    && socket.data.userRole === user.userRole
            );
            return { ...newDto.createdMessage, chatId: newDto.chat.id };
        } catch (e) { }
    }

    @SubscribeMessage('readMessage')
    async handleReadMessage(@MessageBody() dto: string, @ConnectedSocket() socket: Socket) {
        try {
            const parsedDto = JSON.parse(dto);
            const newDto = await this.rmqService.send<
                ReadMessage.Request,
                ReadMessage.Response
            >(ReadMessage.topic, { ...parsedDto, ...socket.data.user });
            this.sendUpdateChat(
                newDto.chat, newDto.users,
                (user) => socket.data.user.userId !== user.userId
                    || socket.data.user.userRole !== user.userRole
            );
            socket.emit('readMessages', [newDto.updatedMessage]);
        } catch (e) { }
    }

    async hasUnreadNotifications(socket: Socket) {
        try {
            const hasUnread = await this.rmqService.send<
                EventGetUnreadServiceNotifications.Request,
                EventGetUnreadServiceNotifications.Response
            >(EventGetUnreadServiceNotifications.topic, socket.data.user);
            socket.emit('hasUnreadNotifications', hasUnread.hasUnreadNotifications);
        } catch (e) { }
    }

    async setUnreadNotifications(dto: EventUpdateAllServiceNotifications.Response, value: number) {
        const key = `${dto.userId}_${dto.userRole}`;
        const socket = this.clients.get(key);
        if (socket) {
            socket.emit('hasUnreadNotifications', value);
        }
    }

    async chats(socket: Socket) {
        try {
            const chats = await this.rmqService.send<
                GetChats.Request,
                GetChats.Response
            >(GetChats.topic, socket.data.user);
            socket.emit('chats', chats.chats);
        } catch (e) { }
    }

    async sendUpdateChat(chat: IGetChat, users: IChatUser[], condition: (user: IChatUser) => boolean) {
        users.map(user => {
            const key = `${user.userId}_${user.userRole}`;
            const socket = this.clients.get(key);
            if (socket) {
                if (condition(user)) {
                    socket.emit('updateChat', { ...chat, countUnread: -1 });
                } else {
                    socket.emit('updateChat', chat);
                }
            }
        })
    }

    sendNewNotification(dto: EventAddServiceNotification.Response) {
        const key = `${dto.notification.userId}_${dto.notification.userRole}`;
        const socket = this.clients.get(key);
        if (socket) {
            socket.emit('newNotification', dto.notification);
            socket.emit('hasUnreadNotifications', 1);
        }
    }

    sendNewNotifications(dto: EventAddServiceNotifications.Response) {
        dto.notifications.map(notification => {
            const key = `${notification.userId}_${notification.userRole}`;
            const socket = this.clients.get(key);
            if (socket) {
                socket.emit('newNotification', notification);
                socket.emit('hasUnreadNotifications', 1);
            }
        })
    }

    sendNewMessage(dto: AddMessage.Response) {
        dto.users.map(user => {
            const key = `${user.userId}_${user.userRole}`;
            const socket = this.clients.get(key);
            if (socket) {
                socket.emit('newMessage', { ...dto.createdMessage, chatId: dto.chat.id });
                socket.emit('readMessages', dto.updatedMessages);
            }
        })
    }

    addNewMessage(dto: AddMessage.Response) {
        dto.users.map(user => {
            const key = `${user.userId}_${user.userRole}`;
            const socket = this.clients.get(key);
            if (socket) {
                socket.emit('newMessage', dto.createdMessage);
                socket.emit('readMessages', dto.updatedMessages);
            }
        })
    }

    sendNewChat(dto: AddChat.Response) {
        dto.users.map(user => {
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