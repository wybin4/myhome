import { IChat, IChatUser, IMessage, MessageStatus } from '@myhome/interfaces';
import { Types } from 'mongoose';

export class ChatEntity implements IChat {
    _id?: Types.ObjectId;
    createdAt: Date;
    users: IChatUser[];
    messages?: IMessage[];

    constructor(chat: IChat) {
        this._id = chat._id;
        this.users = chat.users;
        this.createdAt = chat.createdAt;
        this.messages = chat.messages;
    }

    public get(): IChat {
        return {
            _id: this._id,
            users: this.users,
            createdAt: this.createdAt,
            messages: this.messages
        }
    }
}

export class MessageEntity implements IMessage {
    _id?: Types.ObjectId;
    sender: IChatUser;
    text: string;
    readAt?: Date;
    status: MessageStatus;
    createdAt: Date;

    constructor(message: IMessage) {
        this._id = message._id;
        this.sender = message.sender;
        this.text = message.text;
        this.readAt = message.readAt;
        this.status = message.status;
        this.createdAt = message.createdAt;
    }

    public get(): IMessage {
        return {
            _id: this._id,
            sender: this.sender,
            text: this.text,
            readAt: this.readAt,
            status: this.status,
            createdAt: this.createdAt
        }
    }
}