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

export interface IGetMessage extends IMessage {
    userRole: UserRole;
    userId: number;
}

export interface IGetChat extends IChat {
    userRole: UserRole;
    userId: number;
}

export enum MessageStatus {
    Read = 'Read',
    Unread = 'Unread'
}