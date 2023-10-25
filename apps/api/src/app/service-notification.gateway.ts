import { ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Socket } from "dgram";
import { Server } from "http";
import { Message, RMQService } from "nestjs-rmq";
import { take, Subscription, of, tap } from "rxjs";
import { IServiceNotification, UserRole } from "@myhome/interfaces";
import { Injectable } from "@nestjs/common";
import { GetServiceNotifications } from "@myhome/contracts";

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

    private connectedUsers = new Map<string, { userId: number, userRole: UserRole }>();

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
        const userId = 1; // Замените этот ID на вашу логику получения userId
        const userRole = UserRole.Owner; // Замените на вашу логику получения роли пользователя
        await this.getNotifications(socket, userId, userRole);
    }

    async getNotifications(socket: Socket, userId: number, userRole: UserRole) {
        try {
            const notifications = await this.rmqService.send<
                GetServiceNotifications.Request,
                GetServiceNotifications.Response
            >(GetServiceNotifications.topic, { userId, userRole });
            socket.emit('notifications', notifications);
        } catch (error) {
            // Обработайте ошибку, если она возникнет
            console.error('Error:', error);
        }
    }

    @SubscribeMessage('newNotification')
    handleNewNotification(notification: IServiceNotification, @ConnectedSocket() socket: Socket) {
        return notification;
        // if (
        //     notification.userId === socket.data.user.userId &&
        //     notification.userRole === socket.data.user.userRole
        // ) {
        //     return notification;
        // }
    }

    // getConversations(socket: Socket, userId: number): Subscription {
    //     return this.conversationService
    //         .getConversationsWithUsers(userId)
    //         .subscribe((conversations) => {
    //             this.server.to(socket.id).emit('conversations', conversations);
    //         });
    // }

    handleDisconnect(socket: Socket) {
        // this.conversationService
        //     .leaveConversation(socket.id)
        //     .pipe(take(1))
        //     .subscribe();
    }

    // @SubscribeMessage('createConversation')
    // createConversation(socket: Socket, friend: User) {
    //     this.conversationService
    //         .createConversation(socket.data.user, friend)
    //         .pipe(take(1))
    //         .subscribe(() => {
    //             this.getConversations(socket, socket.data.user.id);
    //         });
    // }

    // @SubscribeMessage('sendMessage')
    // handleMessage(socket: Socket, newMessage: Message) {
    //     if (!newMessage.conversation) return of(null);

    //     const { user } = socket.data;
    //     newMessage.user = user;

    //     if (newMessage.conversation.id) {
    //         this.conversationService
    //             .createMessage(newMessage)
    //             .pipe(take(1))
    //             .subscribe((message: Message) => {
    //                 newMessage.id = message.id;

    //                 this.conversationService
    //                     .getActiveUsers(newMessage.conversation.id)
    //                     .pipe(take(1))
    //                     .subscribe((activeConversations: ActiveConversation[]) => {
    //                         activeConversations.forEach(
    //                             (activeConversation: ActiveConversation) => {
    //                                 this.server
    //                                     .to(activeConversation.socketId)
    //                                     .emit('newMessage', newMessage);
    //                             },
    //                         );
    //                     });
    //             });
    //     }
    // }

    // @SubscribeMessage('joinConversation')
    // joinConversation(socket: Socket, friendId: number) {
    //     this.conversationService
    //         .joinConversation(friendId, socket.data.user.id, socket.id)
    //         .pipe(
    //             tap((activeConversation: ActiveConversation) => {
    //                 this.conversationService
    //                     .getMessages(activeConversation.conversationId)
    //                     .pipe(take(1))
    //                     .subscribe((messages: Message[]) => {
    //                         this.server.to(socket.id).emit('messages', messages);
    //                     });
    //             }),
    //         )
    //         .pipe(take(1))
    //         .subscribe();
    // }

    // @SubscribeMessage('leaveConversation')
    // leaveConversation(socket: Socket) {
    //     this.conversationService
    //         .leaveConversation(socket.id)
    //         .pipe(take(1))
    //         .subscribe();
    // }
}