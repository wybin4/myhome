import { Body, Controller } from '@nestjs/common';
import { RMQError, RMQRoute, RMQValidate } from 'nestjs-rmq';
import { AddChat, AddMessage, GetChats, GetMessages, GetReceivers, ReadMessage } from '@myhome/contracts';
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
            return await this.chatService.getChats(dto);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }

    @RMQValidate()
    @RMQRoute(GetReceivers.topic)
    async getReceivers(@Body() dto: GetReceivers.Request) {
        try {
            return await this.chatService.getReceivers(dto);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }

    @RMQValidate()
    @RMQRoute(AddChat.topic)
    async addChat(@Body() dto: AddChat.Request) {
        try {
            return await this.chatService.addChat(dto);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }

    @RMQValidate()
    @RMQRoute(AddMessage.topic)
    async addMessage(@Body() dto: AddMessage.Request) {
        try {
            return await this.chatService.addMessage(dto);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }

    @RMQValidate()
    @RMQRoute(ReadMessage.topic)
    async readMessage(@Body() dto: ReadMessage.Request) {
        try {
            return await this.chatService.readMessage(dto);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }

    @RMQValidate()
    @RMQRoute(GetMessages.topic)
    async getMessages(@Body() dto: GetMessages.Request) {
        try {
            return await this.chatService.getMessages(dto);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }

}
