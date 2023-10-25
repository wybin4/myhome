import { IChat, IMessage, MessageStatus, SenderType } from '@myhome/interfaces';
import { Types } from 'mongoose';

export class ChatEntity implements IChat {
    _id?: Types.ObjectId;
    appealId: number;
    createdAt: Date;
    messages?: IMessage[];

    constructor(chat: IChat) {
        this._id = chat._id;
        this.appealId = chat.appealId;
        this.createdAt = chat.createdAt;
        this.messages = chat.messages;
    }

    public get(): IChat {
        return {
            appealId: this.appealId,
            createdAt: this.createdAt,
            messages: this.messages
        }
    }
}

export class MessageEntity implements IMessage {
    _id?: Types.ObjectId;
    senderId: number;
    senderRole: SenderType;
    text: string;
    readAt?: Date;
    status?: MessageStatus;
    createdAt: Date;

    constructor(message: IMessage) {
        this._id = message._id;
        this.senderId = message.senderId;
        this.senderRole = message.senderRole;
        this.text = message.text;
        this.readAt = message.readAt;
        this.status = message.status;
        this.createdAt = message.createdAt;
    }

    public get(): IMessage {
        return {
            senderId: this.senderId,
            senderRole: this.senderRole,
            text: this.text,
            readAt: this.readAt,
            status: this.status,
            createdAt: this.createdAt
        }
    }
}