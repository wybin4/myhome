import { IChat, IMessage, MessageStatus, SenderType } from '@myhome/interfaces';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Message extends Document implements IMessage {
    @Prop({ required: true })
    senderId: number;

    @Prop({
        type: String,
        enum: Object.values(SenderType),
        required: true
    })
    senderRole: SenderType;

    @Prop({ required: true })
    text: string;

    @Prop({ required: true })
    createdAt: Date;

    readAt?: Date;

    @Prop({
        type: String,
        enum: Object.values(MessageStatus),
        required: true,
        default: MessageStatus.Unread
    })
    status?: MessageStatus;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

@Schema()
export class Chat extends Document implements IChat {
    @Prop({ required: true, unique: true })
    appealId: number;

    @Prop({ type: [MessageSchema] })
    messages: IMessage[];

    @Prop({ type: Date, default: Date.now, required: true })
    createdAt: Date;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);