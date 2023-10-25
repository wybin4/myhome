import { Injectable } from "@nestjs/common";
import { RMQService } from "nestjs-rmq";
import { ChatRepository } from "./chat.repository";
import { AppealAddChat, AppealAddMessage, AppealGetAppeal, AppealGetChats } from "@myhome/contracts";
import { APPEALS_NOT_EXIST, RMQException, SENDER_NOT_EXIST } from "@myhome/constants";
import { IChat, SenderType } from "@myhome/interfaces";
import { ChatEntity, MessageEntity } from "./chat.entity";
import { AppealService } from "../appeal/appeal.service";

@Injectable()
export class ChatService {
    constructor(
        private readonly chatRepository: ChatRepository,
        private readonly rmqService: RMQService,
        private readonly appealService: AppealService
    ) { }

    async getChats(dto: AppealGetChats.Request): Promise<AppealGetChats.Response> {
        const appeals = await this.appealService.getAppeals(dto.userId, dto.userType);
        if (!appeals) {
            throw new RMQException(APPEALS_NOT_EXIST.message, APPEALS_NOT_EXIST.status);
        }
        const appealIds = appeals.map(a => a.id);
        const chats = await this.chatRepository.findManyByAppealIds(appealIds);
        return { chats };
    }

    async addChat(appealId: number): Promise<AppealAddChat.Response> {
        await this.checkAppeal(appealId);

        const chat: IChat = {
            appealId: appealId,
            createdAt: new Date()
        };
        const newChatEntity = new ChatEntity(chat);
        const newChat = await this.chatRepository.create(newChatEntity);

        return { chat: newChat }
    }

    private async checkAppeal(appealId: number) {
        try {
            return await
                this.rmqService.send<
                    AppealGetAppeal.Request,
                    AppealGetAppeal.Response
                >
                    (AppealGetAppeal.topic, { id: appealId });
        } catch (e) {
            throw new RMQException(e.message, e.status);
        }
    }

    async addMessage(dto: AppealAddMessage.Request): Promise<AppealAddMessage.Response> {
        const chat = await this.chatRepository.findById(dto.chatId);
        const { appeal } = await this.appealService.getAppeal(chat.appealId);
        if (
            (appeal.subscriberId === dto.senderId && SenderType.Subscriber)
            || (appeal.managementCompanyId === dto.senderId && SenderType.ManagementCompany)
        ) {
            const message = new MessageEntity({
                senderId: dto.senderId,
                senderRole: dto.senderRole,
                text: dto.text,
                createdAt: new Date(),
            });
            chat.messages.push(message);
            await chat.save();
            return { message };
        } else {
            throw new RMQException(SENDER_NOT_EXIST.message, SENDER_NOT_EXIST.status);
        }
    }
}