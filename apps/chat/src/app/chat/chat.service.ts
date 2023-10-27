import { Injectable } from "@nestjs/common";
import { ChatRepository } from "./chat.repository";
import { AddChat, AddMessage, GetChats } from "@myhome/contracts";
import { RMQException, SENDER_NOT_EXIST } from "@myhome/constants";
import { IChat, SenderType, UserRole } from "@myhome/interfaces";
import { ChatEntity, MessageEntity } from "./chat.entity";
import { AppealService } from "../appeal/appeal.service";
import { ChatEventEmitter } from "./chat.event-emitter";

@Injectable()
export class ChatService {
    constructor(
        private readonly chatRepository: ChatRepository,
        private readonly appealService: AppealService,
        private readonly eventEmitter: ChatEventEmitter
    ) { }

    async getChats(dto: GetChats.Request): Promise<GetChats.Response> {
        const userType = dto.userRole === UserRole.Owner ? SenderType.Subscriber : SenderType.ManagementCompany;

        const appeals = await this.appealService.getAppeals(dto.userId, userType);
        if (!appeals) {
            return;
        }
        const appealIds = appeals.map(a => a.id);
        const chats = await this.chatRepository.findManyByAppealIds(appealIds);
        return { chats };
    }

    async addChat(appealId: number): Promise<AddChat.Response> {
        const { appeal } = await this.appealService.getAppeal(appealId);

        const chat: IChat = {
            appealId: appealId,
            createdAt: new Date()
        };
        const newChatEntity = new ChatEntity(chat);
        const newChat = await this.chatRepository.create(newChatEntity);

        // уведомляем владельца
        await this.eventEmitter.handleChat({
            userId: appeal.ownerId,
            userRole: UserRole.Owner,
            ...chat
        });

        // уведомляем УК
        await this.eventEmitter.handleChat({
            userId: appeal.managementCompanyId,
            userRole: UserRole.ManagementCompany,
            ...chat
        });

        return { chat: newChat }
    }


    async addMessage(dto: AddMessage.Request): Promise<AddMessage.Response> {
        const chat = await this.chatRepository.findById(dto.chatId);
        const { appeal } = await this.appealService.getAppeal(chat.appealId);
        if (
            (appeal.subscriberId === dto.senderId && dto.senderRole === SenderType.Subscriber)
            || (appeal.managementCompanyId === dto.senderId && dto.senderRole === SenderType.ManagementCompany)
        ) {
            const message = new MessageEntity({
                senderId: dto.senderId,
                senderRole: dto.senderRole,
                text: dto.text,
                createdAt: new Date(),
            });
            chat.messages.push(message);
            await chat.save();

            if (dto.senderRole === SenderType.Subscriber) {
                await this.eventEmitter.handleMessage({
                    userId: appeal.ownerId,
                    userRole: UserRole.Owner,
                    ...message
                });
            } else if (dto.senderRole === SenderType.ManagementCompany) {
                await this.eventEmitter.handleMessage({
                    userId: appeal.managementCompanyId,
                    userRole: UserRole.ManagementCompany,
                    ...message
                });
            }

            return {
                message: {
                    chatId: chat.id,
                    ...message
                }
            };
        } else {
            throw new RMQException(SENDER_NOT_EXIST.message, SENDER_NOT_EXIST.status);
        }
    }
}