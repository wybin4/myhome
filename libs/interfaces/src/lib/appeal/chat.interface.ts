import { Types } from "mongoose";

export interface IChat {
    _id?: Types.ObjectId;
    appealId: number;
    createdAt: Date;
    messages?: IMessage[];
}

export interface IMessage {
    _id?: Types.ObjectId;
    senderId: number;
    senderRole: SenderType;
    text: string;
    createdAt: Date;
    readAt?: Date;
    status?: MessageStatus;
}

export enum MessageStatus {
    Read = 'Read',
    Unread = 'Unread'
}

export enum SenderType {
    ManagementCompany = 'ManagementCompany',
    Subscriber = 'Subscriber'
}