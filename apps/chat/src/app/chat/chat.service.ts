import { HttpStatus, Injectable } from "@nestjs/common";
import { ChatRepository } from "./chat.repository";
import { AddChat, AddMessage, GetChats } from "@myhome/contracts";
import { RMQException, checkUser, checkUsers } from "@myhome/constants";
import { IChatUser, UserRole } from "@myhome/interfaces";
import { ChatEntity, MessageEntity } from "./chat.entity";
import { ChatEventEmitter } from "./chat.event-emitter";
import { RMQService } from "nestjs-rmq";

@Injectable()
export class ChatService {
    constructor(
        private readonly rmqService: RMQService,
        private readonly chatRepository: ChatRepository,
        private readonly eventEmitter: ChatEventEmitter
    ) { }

    async getChats(dto: GetChats.Request): Promise<GetChats.Response> {
        await checkUser(this.rmqService, dto.userId, dto.userRole);
        const chats = await this.chatRepository.findManyByUser(dto);
        return { chats };
    }

    async addChat(dto: AddChat.Request): Promise<AddChat.Response> {
        if (!dto.users.length) {
            return;
        }
        const { users } = await this.checkMultiUsers(dto.users);

        const newChat = await this.chatRepository.create(new ChatEntity({
            users: users,
            createdAt: new Date()
        }));

        // уведомляем
        users.map(async user => {
            await this.eventEmitter.handleChat({
                userId: user.userId,
                userRole: user.userRole,
                ...newChat
            });
        })

        return { chat: newChat }
    }

    private async checkMultiUsers(users: IChatUser[]) {
        const managementCs = users.filter(u => u.userRole === UserRole.ManagementCompany);
        const owners = users.filter(u => u.userRole === UserRole.Owner);

        if (!owners.length && !managementCs.length) {
            throw new RMQException("Для добавления чата нужны пользователи", HttpStatus.BAD_REQUEST)
        }

        if ((owners.length <= 1 && managementCs.length === 0) || (owners.length === 0 && managementCs.length <= 1)) {
            throw new RMQException("Для добавления чата нужно хотя бы два пользователя", HttpStatus.BAD_REQUEST)
        }

        const realUsers: IChatUser[] = [];
        if (owners && owners.length) {
            const { profiles } = await checkUsers(this.rmqService, owners.map(o => o.userId), UserRole.Owner);
            realUsers.push(...profiles.map(profile => {
                return {
                    userId: profile.id,
                    userRole: UserRole.Owner
                };
            }));
        }
        if (managementCs && managementCs.length) {
            const { profiles } = await checkUsers(this.rmqService, managementCs.map(mc => mc.userId), UserRole.ManagementCompany);
            realUsers.push(...profiles.map(profile => {
                return {
                    userId: profile.id,
                    userRole: UserRole.ManagementCompany
                };
            }));
        }
        return { users: realUsers };
    }

    async addMessage(dto: AddMessage.Request): Promise<AddMessage.Response> {
        const chat = await this.chatRepository.findById(dto.chatId);
        if (
            !chat.users.includes({
                userId: dto.senderId,
                userRole: dto.senderRole
            })
        ) {
            throw new RMQException("Вы не можете писать в этот чат", HttpStatus.BAD_REQUEST);
        }
        const message = new MessageEntity({
            sender: {
                userId: dto.senderId,
                userRole: dto.senderRole
            },
            text: dto.text,
            createdAt: new Date(),
        });
        chat.messages.push(message);
        await chat.save();

        await this.eventEmitter.handleMessage({
            userId: dto.senderId,
            userRole: dto.senderRole,
            ...message
        });

        return {
            message: {
                chatId: chat.id,
                ...message
            }
        };
    }
}