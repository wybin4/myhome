import { Types } from "mongoose";
import { UserRole } from "./account/user.interface";

export interface IChat {
    _id?: Types.ObjectId;
    createdAt: Date;
    users: IChatUser[];
    messages?: IMessage[];
}

export interface IMessage {
    _id?: Types.ObjectId;
    sender: IChatUser;
    text: string;
    createdAt: Date;
    readAt?: Date;
    status?: MessageStatus;
}

export interface IChatUser {
    userId: number;
    userRole: UserRole;
}

export interface IGetChat extends IChat {
    receiver: IChatUser;
}

export interface IGetChats {
    _id?: Types.ObjectId;
    createdAt: Date;
    messages?: IMessage[];
    users: IGetChatUser[];
}

export interface IGetChatUser extends IChatUser {
    name: string;
}

export interface IGetMessage extends IMessage {
    receiver: IChatUser;
    chatId: string;
}

export enum MessageStatus {
    Read = 'Read',
    Unread = 'Unread'
}