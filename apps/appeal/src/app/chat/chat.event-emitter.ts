import { Injectable } from "@nestjs/common";
import { AppealGetChat, AppealGetMessage } from "@myhome/contracts";
import { RMQService } from "nestjs-rmq";
import { IGetChat, IGetMessage } from "@myhome/interfaces";

@Injectable()
export class ChatEventEmitter {
    constructor(private readonly rmqService: RMQService) { }

    async handleMessage(message: IGetMessage) {
        await this.rmqService.notify<AppealGetMessage.Request>(AppealGetMessage.topic, { message });
    }

    async handleChat(chat: IGetChat) {
        await this.rmqService.notify<AppealGetChat.Request>(AppealGetChat.topic, { chat });
    }
}