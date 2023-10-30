import { Injectable } from "@nestjs/common";
import { ApiEmitChat, ApiEmitMessage, ApiEmitMessages } from "@myhome/contracts";
import { RMQService } from "nestjs-rmq";

@Injectable()
export class ChatEventEmitter {
    constructor(private readonly rmqService: RMQService) { }

    async handleMessage(dto: ApiEmitMessage.Request) {
        await this.rmqService.notify<ApiEmitMessage.Request>(ApiEmitMessage.topic, dto);
    }

    async handleMessages(dto: ApiEmitMessages.Request) {
        await this.rmqService.notify<ApiEmitMessages.Request>(ApiEmitMessages.topic, dto);
    }

    async handleChat(dto: ApiEmitChat.Request) {
        await this.rmqService.notify<ApiEmitChat.Request>(ApiEmitChat.topic, dto);
    }
}