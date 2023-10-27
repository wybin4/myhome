import { Injectable } from "@nestjs/common";
import { GetChat, GetMessage } from "@myhome/contracts";
import { RMQService } from "nestjs-rmq";
import { IGetChat, IGetMessage } from "@myhome/interfaces";

@Injectable()
export class ChatEventEmitter {
    constructor(private readonly rmqService: RMQService) { }

    async handleMessage(message: IGetMessage) {
        await this.rmqService.notify<GetMessage.Request>(GetMessage.topic, { message });
    }

    async handleChat(chat: IGetChat) {
        await this.rmqService.notify<GetChat.Request>(GetChat.topic, { chat });
    }
}