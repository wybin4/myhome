import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from "socket.io";

@WebSocketGateway()
export class NotificationSocketController {
    @WebSocketServer()
    server: Server;

    @SubscribeMessage('events')
    handleEvent(@MessageBody() data: string): string {
        // Обработка сообщения
        return data;
    }
}