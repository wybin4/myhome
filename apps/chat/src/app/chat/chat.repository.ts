import { InjectModel } from '@nestjs/mongoose';
import { HttpStatus, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { ChatEntity } from './chat.entity';
import { Chat, Message } from './chat.model';
import { IChatUser, IMessage, MessageStatus, UserRole } from '@myhome/interfaces';
import { CHAT_NOT_EXIST, MESSAGE_NOT_EXIST, RMQException } from '@myhome/constants';

@Injectable()
export class ChatRepository {
    constructor(
        @InjectModel(Chat.name) private readonly chatModel: Model<Chat>,
        @InjectModel(Message.name) private readonly messageModel: Model<Message>
    ) { }

    async create(chat: ChatEntity) {
        const newChat = new this.chatModel(chat);
        return await newChat.save();
    }

    async findChatById(chatId: string): Promise<Chat> {
        return await this.chatModel.findById(chatId);
    }

    async findManyByUser(user: IChatUser): Promise<Chat[]> {
        return await this.chatModel.find({
            users: {
                $elemMatch: {
                    userId: user.userId,
                    userRole: user.userRole,
                },
            },
        }).exec();
    }

    getUnreadCondition(message: IMessage, myId: number, myRole: UserRole): boolean {
        return message.status === MessageStatus.Unread && (message.sender.userId !== myId || message.sender.userRole !== myRole);
    }

    private async readMessages(chat: Chat, myId: number, myRole: UserRole) {
        for (const message of chat.messages) {
            if (this.getUnreadCondition(message, myId, myRole)) {
                message.status = MessageStatus.Read;
                message.readAt = new Date();
            }
        }
    }

    private async readMessagesAndSave(chat: Chat, myId: number, myRole: UserRole): Promise<IMessage[]> {
        const updatedMessages: IMessage[] = [];
        for (const message of chat.messages) {
            if (this.getUnreadCondition(message, myId, myRole)) {
                message.status = MessageStatus.Read;
                message.readAt = new Date();
                updatedMessages.push((message as Message).toObject());
            }
        }
        return updatedMessages;
    }

    async findChatAndRead(chatId: string, myId: number, myRole: UserRole): Promise<Chat> {
        const chat = await this.findChatById(chatId);
        if (!chat) {
            return null;
        }
        await this.readMessages(chat, myId, myRole);
        await chat.save();
        return chat;
    }

    async readMessage(chatId: string, messageId: string, myId: number, myRole: UserRole): Promise<{ chat: Chat, message: IMessage }> {
        const chat = await this.chatModel.findById(chatId);
        if (!chat) {
            throw new RMQException(CHAT_NOT_EXIST.message(chatId), CHAT_NOT_EXIST.status);
        }
        const exists = chat.users.some(user => {
            return user.userId === myId && user.userRole === myRole;
        });
        if (!exists) {
            throw new RMQException("Вы не можете прочесть это сообщение", HttpStatus.BAD_REQUEST);
        }

        const messageIndex = chat.messages.findIndex(message => message._id.toString() === messageId);
        if (messageIndex === -1) {
            throw new RMQException(MESSAGE_NOT_EXIST.message(messageId), CHAT_NOT_EXIST.status);
        }

        const message = chat.messages[messageIndex];
        message.status = MessageStatus.Read;
        message.readAt = new Date();

        await chat.save();

        return { chat, message: (message as Message).toObject() };
    }

    async createMessage(chatId: string, message: IMessage): Promise<{
        chat: Chat, updatedMessages: IMessage[], newMessage: IMessage
    }> {
        const userId = message.sender.userId;
        const userRole = message.sender.userRole;

        const chat = await this.findChatById(chatId);
        if (!chat) {
            throw new RMQException(CHAT_NOT_EXIST.message(chatId), CHAT_NOT_EXIST.status);
        }
        const exists = chat.users.some(user => {
            return user.userId === userId && user.userRole === userRole;
        });
        if (!exists) {
            throw new RMQException("Вы не можете писать в этот чат", HttpStatus.BAD_REQUEST);
        }

        const newMessage = new this.messageModel(message);
        chat.messages.push(newMessage);

        const updatedMessages = await this.readMessagesAndSave(chat, userId, userRole);

        await chat.save();
        return { chat, updatedMessages, newMessage: newMessage.toObject() };
    }

}
