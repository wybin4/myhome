import { HttpStatus, Injectable } from "@nestjs/common";
import { ChatRepository } from "./chat.repository";
import { AddChat, AddMessage, GetChats } from "@myhome/contracts";
import { CHAT_NOT_EXIST, RMQException, checkUsers } from "@myhome/constants";
import { IChatUser, IGetChatUser, MessageStatus, UserRole } from "@myhome/interfaces";
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
        const chats = await this.chatRepository.findManyByUser(dto);
        if (!chats) {
            return;
        }
        const chatEnitites = chats.map(chat => new ChatEntity(chat));

        const allUsers = chats.map((chat) => chat.users).flat();
        const uniqueArray = allUsers.filter((obj, index, self) =>
            index === self.findIndex((o) => JSON.stringify(o) === JSON.stringify(obj))
        );
        const { users } = await this.checkMultiUsers(uniqueArray);

        return {
            chats: chatEnitites.map(chat => {
                return {
                    _id: chat._id,
                    users: chat.users.map(user => {
                        const currentUser = users.find(us => us.userId === user.userId && us.userRole === user.userRole);
                        return {
                            name: currentUser.name,
                            userId: currentUser.userId,
                            userRole: currentUser.userRole
                        };
                    }),
                    messages: chat.messages,
                    createdAt: chat.createdAt
                };
            })
        };
    }

    async addChat(dto: AddChat.Request): Promise<AddChat.Response> {
        if (!dto.users.length) {
            return;
        }
        const { users } = await this.checkMultiUsers(dto.users);

        const newChat = await this.chatRepository.create(new ChatEntity({
            users: users.map(u => {
                return {
                    userId: u.userId,
                    userRole: u.userRole,
                };
            }),
            createdAt: new Date()
        }));
        const chat = new ChatEntity(newChat);

        // уведомляем
        users.map(async user => {
            await this.eventEmitter.handleChat({
                receiver: {
                    userId: user.userId,
                    userRole: user.userRole,
                },
                ...chat,
                users: chat.users.map(u => {
                    const currentUser = users.find(us => us.userId === u.userId && us.userRole === u.userRole);
                    return {
                        userId: u.userId,
                        userRole: u.userRole,
                        name: currentUser.name
                    };
                })
            });
        })

        return { chat: chat }
    }

    private async checkMultiUsers(users: IChatUser[]): Promise<{ users: IGetChatUser[] }> {
        const managementCs = users.filter(u => u.userRole === UserRole.ManagementCompany);
        const owners = users.filter(u => u.userRole === UserRole.Owner);

        if (!owners.length && !managementCs.length) {
            throw new RMQException("Для чата нужны пользователи", HttpStatus.BAD_REQUEST)
        }

        if ((owners.length <= 1 && managementCs.length === 0) || (owners.length === 0 && managementCs.length <= 1)) {
            throw new RMQException("Для чата нужно хотя бы два пользователя", HttpStatus.BAD_REQUEST)
        }

        const realUsers: IGetChatUser[] = [];
        if (owners && owners.length) {
            const { profiles } = await checkUsers(this.rmqService, owners.map(o => o.userId), UserRole.Owner);
            realUsers.push(...profiles.map(profile => {
                return {
                    userId: profile.id,
                    userRole: UserRole.Owner,
                    name: profile.name
                };
            }));
        }
        if (managementCs && managementCs.length) {
            const { profiles } = await checkUsers(this.rmqService, managementCs.map(mc => mc.userId), UserRole.ManagementCompany);
            realUsers.push(...profiles.map(profile => {
                return {
                    userId: profile.id,
                    userRole: UserRole.ManagementCompany,
                    name: profile.name
                };
            }));
        }
        return { users: realUsers };
    }

    async addMessage(dto: AddMessage.Request): Promise<AddMessage.Response> {
        const chat = await this.chatRepository.findById(dto.chatId);
        if (!chat) {
            throw new RMQException(CHAT_NOT_EXIST.message(dto.chatId), CHAT_NOT_EXIST.status);
        }
        const exists = chat.users.some(user => {
            return user.userId === dto.senderId && user.userRole === dto.senderRole;
        });
        if (!exists) {
            throw new RMQException("Вы не можете писать в этот чат", HttpStatus.BAD_REQUEST);
        }

        const message = new MessageEntity({
            sender: {
                userId: dto.senderId,
                userRole: dto.senderRole
            },
            text: dto.text,
            createdAt: new Date(),
            status: MessageStatus.Unread
        });
        chat.messages.push(message);
        await chat.save();

        // уведомляем всех
        chat.users.map(async user => {
            await this.eventEmitter.handleMessage({
                receiver: {
                    userId: user.userId,
                    userRole: user.userRole,
                },
                chatId: chat.id,
                ...message.get()
            });
        });

        return {
            message: {
                chatId: chat.id,
                ...message
            }
        };
    }
}