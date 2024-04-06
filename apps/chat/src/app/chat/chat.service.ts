import { HttpStatus, Injectable } from "@nestjs/common";
import { ChatRepository } from "./chat.repository";
import { AddChat, AddMessage, GetChats, GetMessages, GetReceivers, ReadMessage } from "@myhome/contracts";
import { CHAT_NOT_EXIST, RMQException, USER_NOT_EXIST, checkUser, checkUsers, getReceiversByOwner, getSubscribersByMCId } from "@myhome/constants";
import { IChatUser, IGetChat, IGetChatUser, IGetMessage, IMessage, IMessageGroupByCreatedAt, MessageStatus, UserRole } from "@myhome/interfaces";
import { ChatEntity, MessageEntity } from "./chat.entity";
import { RMQService } from "nestjs-rmq";
import { Chat, Message } from "./chat.model";

@Injectable()
export class ChatService {
    constructor(
        private readonly rmqService: RMQService,
        private readonly chatRepository: ChatRepository
    ) { }

    private getCountUnread(messages: IMessage[], myId: number, myRole: UserRole): number {
        return messages.filter(message => this.chatRepository.getUnreadCondition(message, myId, myRole)).length;
    }

    private mapChatToDTO(
        chat: Chat, myId: number, myRole: UserRole,
        users: IGetChatUser[], receiverName?: string, receiverRole?: UserRole,
        countUnread?: number
    ): IGetChat {
        const chatEntity = chat.toObject();
        if (!receiverName) {
            receiverName = users.map(us => {
                if (us.userRole === UserRole.Owner) {
                    const nameWords = us.name.split(' ');
                    if (nameWords.length > 2) {
                        return { ...us, name: nameWords.slice(0, 2).join(' ') };
                    }
                }
                return us;
            }).find(us => us.userId !== myId || us.userRole !== myRole).name;
        } else {
            if (receiverRole === UserRole.Owner) {
                const nameWords = receiverName.split(' ');
                if (nameWords.length > 2) {
                    receiverName = nameWords.slice(0, 2).join(' ');
                }
            }
        }

        let lastMessage;
        if (chatEntity.messages.length > 0) {
            const sortedMessages = chatEntity.messages.sort((a, b) => {
                const createdAtA = a.createdAt.getTime();
                const createdAtB = b.createdAt.getTime();
                return createdAtB - createdAtA;
            });
            lastMessage = this.mapMessageToDTO(sortedMessages[0]);
        } else {
            lastMessage = null;
        }

        return {
            id: chatEntity._id.toString(),
            lastMessage,
            receiverName,
            countUnread: countUnread ? countUnread : this.getCountUnread(chatEntity.messages, myId, myRole),
            createdAt: chatEntity.createdAt
        };
    }

    private mapMessageToDTO(message: IMessage): IGetMessage {
        return {
            ...message,
            createdAt: message.createdAt.getTime(),
            id: message._id.toString()
        }
    }

    async getChats(dto: GetChats.Request): Promise<GetChats.Response> {
        const chats = await this.chatRepository.findManyByUser(dto);
        if (!chats || !chats.length) {
            return { chats: [] };
        }

        const allUsers = chats.map((chat) => chat.users).flat();
        const uniqueArray = allUsers.filter((obj, index, self) =>
            index === self.findIndex((o) => JSON.stringify(o) === JSON.stringify(obj))
        );
        const { users } = await this.checkMultiUsers(uniqueArray);

        return { chats: chats.map(chat => this.mapChatToDTO(chat, dto.userId, dto.userRole, users)) };
    }

    async getMessages(dto: GetMessages.Request): Promise<GetMessages.Response> {
        const chat = await this.chatRepository.findChatAndRead(dto.chatId, dto.userId, dto.userRole);
        if (!chat) {
            throw new RMQException(CHAT_NOT_EXIST.message(dto.chatId), CHAT_NOT_EXIST.status);
        }

        const otherUser = chat.users.find(us => us.userId !== dto.userId || us.userRole !== dto.userRole);
        const { profile } = await checkUser(this.rmqService, otherUser.userId, otherUser.userRole);
        if (!profile) {
            throw new RMQException(USER_NOT_EXIST.message(otherUser.userId), USER_NOT_EXIST.status);
        }

        const resChat = this.mapChatToDTO(chat, dto.userId, dto.userRole, [], profile.name, otherUser.userRole);
        const messages = chat.messages.map((m: Message) => m.toObject());

        if (!messages || !messages.length) {
            return { messages: [], chat: resChat, users: chat.users };
        }

        const groupedMessages: IMessageGroupByCreatedAt[] = [];
        messages.reduce((acc, message) => {
            const messageDate = new Date(message.createdAt);
            const dateString = messageDate.toISOString().split('T')[0];
            let messageGroup = acc.find(group => {
                const groupDate = new Date(group.createdAt);
                return groupDate.toDateString() === messageDate.toDateString();
            });
            if (!messageGroup) {
                messageGroup = {
                    messages: [],
                    createdAt: new Date(dateString),
                };
                acc.push(messageGroup);
            }
            messageGroup.messages.push(this.mapMessageToDTO(message));
            return acc;
        }, groupedMessages);


        return { messages: groupedMessages, chat: resChat, users: chat.users };
    }

    async addChat(dto: AddChat.Request): Promise<AddChat.Response> {
        if (!dto.users.length) {
            return;
        }
        const { users } = await this.checkMultiUsers(dto.users);
        const otherUser = users.find(us => us.userId !== dto.userId || us.userRole !== dto.userRole);

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

        return {
            chat: {
                id: chat._id.toString(),
                countUnread: 0,
                lastMessage: null,
                receiverName: otherUser.name,
                createdAt: chat.createdAt
            },
            users: users
        }
    }

    async addMessage(dto: AddMessage.Request): Promise<AddMessage.Response> {
        const message = new MessageEntity({
            sender: {
                userId: dto.userId,
                userRole: dto.userRole
            },
            text: dto.text,
            createdAt: new Date(dto.createdAt),
            status: MessageStatus.Unread
        });

        try {
            const { chat, updatedMessages, newMessage } = await this.chatRepository.createMessage(dto.chatId, message);
            const { profile } = await checkUser(this.rmqService, dto.userId, dto.userRole);
            const createdMessage = this.mapMessageToDTO(newMessage);
            
            return {
                users: chat.users,
                chat: {
                    ...this.mapChatToDTO(
                        chat, dto.userId, dto.userRole,
                        [], profile.name, dto.userRole
                    ),
                    lastMessage: createdMessage
                },
                createdMessage,
                updatedMessages: updatedMessages.map(um => this.mapMessageToDTO(um))
            };
        } catch (e) {
            throw new RMQException(e.message, HttpStatus.BAD_REQUEST);
        }
    }

    async readMessage(dto: ReadMessage.Request): Promise<ReadMessage.Response> {
        try {
            const { chat, message } = await this.chatRepository.readMessage(
                dto.chatId, dto.messageId,
                dto.userId, dto.userRole
            );
            const otherUser = chat.users.find(us => us.userId !== dto.userId || us.userRole !== dto.userRole);
            const { profile } = await checkUser(this.rmqService, otherUser.userId, otherUser.userRole);
            if (!profile) {
                throw new RMQException(USER_NOT_EXIST.message(otherUser.userId), USER_NOT_EXIST.status);
            }

            return {
                chat: this.mapChatToDTO(chat, dto.userId, dto.userRole, [], profile.name, otherUser.userRole),
                users: chat.users,
                updatedMessage: this.mapMessageToDTO(message)
            };
        } catch (e) {
            throw new RMQException(e.message, HttpStatus.BAD_REQUEST);
        }
    }

    async getReceivers(dto: GetReceivers.Request): Promise<GetReceivers.Response> {
        const chats = await this.chatRepository.findManyByUser({ userId: dto.userId, userRole: dto.userRole });
        const users = chats.flatMap(c => c.users);

        switch (dto.userRole) {
            case UserRole.Owner: {
                const { receivers } = await getReceiversByOwner(this.rmqService, dto.userId);
                return {
                    receivers: receivers.filter(receiver =>
                        !users.some(user =>
                            receiver.userId === user.userId &&
                            receiver.userRole === user.userRole
                        ))
                };
            }
            case UserRole.ManagementCompany: {
                const { subscribers } = await getSubscribersByMCId(this.rmqService, dto.userId);
                const uniqueOwners = new Set();

                const receivers = subscribers.reduce((accumulator, subscriber) => {
                    const ownerId = subscriber.ownerId;
                    if (!uniqueOwners.has(ownerId)) {
                        uniqueOwners.add(ownerId);
                        accumulator.push({
                            userId: ownerId,
                            userRole: UserRole.Owner,
                            name: subscriber.ownerName
                        });
                    }

                    return accumulator;
                }, []);

                return {
                    receivers: receivers.filter(receiver =>
                        !users.some(user =>
                            receiver.userId === user.userId &&
                            receiver.userRole === user.userRole
                        ))
                };
            }
            default:
                return;
        }
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
}