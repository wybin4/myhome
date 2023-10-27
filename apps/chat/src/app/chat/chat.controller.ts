import { Body, Controller } from '@nestjs/common';
import { RMQError, RMQRoute, RMQValidate } from 'nestjs-rmq';
import { AddChat, AddMessage, GetChats } from '@myhome/contracts';
import { ChatService } from './chat.service';
import { ERROR_TYPE } from 'nestjs-rmq/dist/constants';

@Controller("chat")
export class ChatController {
    constructor(
        private readonly chatService: ChatService
    ) { }

    @RMQValidate()
    @RMQRoute(GetChats.topic)
    async getChats(@Body() dto: GetChats.Request) {
        try {
            return this.chatService.getChats(dto);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.code);
        }
    }

    @RMQValidate()
    @RMQRoute(AddChat.topic)
    async addChat(@Body() { appealId }: AddChat.Request) {
        try {
            return this.chatService.addChat(appealId);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.code);
        }
    }

    @RMQValidate()
    @RMQRoute(AddMessage.topic)
    async addMessage(@Body() dto: AddMessage.Request) {
        try {
            return this.chatService.addMessage(dto);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.code);
        }
    }
}
