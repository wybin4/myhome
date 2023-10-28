import { Injectable } from "@nestjs/common";
import { ApiEmitChat, ApiEmitMessage } from "@myhome/contracts";
import { RMQService } from "nestjs-rmq";
import { IGetChat, IGetMessage } from "@myhome/interfaces";

@Injectable()
export class ChatEventEmitter {
    constructor(private readonly rmqService: RMQService) { }

    async handleMessage(message: IGetMessage) {
        await this.rmqService.notify<ApiEmitMessage.Request>(ApiEmitMessage.topic, { message });
    }

    async handleChat(chat: IGetChat) {
        console.log(chat.users)
        await this.rmqService.notify<ApiEmitChat.Request>(ApiEmitChat.topic, { chat });
    }
}