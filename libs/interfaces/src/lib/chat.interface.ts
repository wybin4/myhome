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
    status: MessageStatus;
}

export interface IChatUser {
    userId: number;
    userRole: UserRole;
}

export interface IGetChat {
    id: string;
    createdAt: Date;
    lastMessage: IGetMessage;
    countUnread: number;
    receiverName: string;
}

export interface IGetMessage {
    id: string;
    sender: IChatUser;
    text: string;
    createdAt: number;
    readAt?: Date;
    status: MessageStatus;
}

export interface IMessageGroupByCreatedAt {
    messages: IGetMessage[];
    createdAt: Date;
}

export interface IGetChatUser extends IChatUser {
    name: string;
}

export enum MessageStatus {
    Read = 'Read',
    Unread = 'Unread'
}