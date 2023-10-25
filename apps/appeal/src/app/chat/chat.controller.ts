import { Body, Controller } from '@nestjs/common';
import { RMQError, RMQRoute, RMQValidate } from 'nestjs-rmq';
import { AppealAddChat, AppealAddMessage, AppealGetChats } from '@myhome/contracts';
import { ChatService } from './chat.service';
import { ERROR_TYPE } from 'nestjs-rmq/dist/constants';

@Controller("chat")
export class ChatController {
    constructor(
        private readonly chatService: ChatService
    ) { }

    @RMQValidate()
    @RMQRoute(AppealGetChats.topic)
    async getChats(@Body() dto: AppealGetChats.Request) {
        try {
            return this.chatService.getChats(dto);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.code);
        }
    }

    @RMQValidate()
    @RMQRoute(AppealAddChat.topic)
    async addChat(@Body() { appealId }: AppealAddChat.Request) {
        try {
            return this.chatService.addChat(appealId);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.code);
        }
    }

    @RMQValidate()
    @RMQRoute(AppealAddMessage.topic)
    async addMessage(@Body() dto: AppealAddMessage.Request) {
        try {
            return this.chatService.addMessage(dto);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.code);
        }
    }
}
