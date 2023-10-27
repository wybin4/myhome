import { IChatUser, IMessage } from '@myhome/interfaces';
import { IsString, MaxLength } from 'class-validator';

export namespace AddMessage {
    export const topic = 'chat.add-message.command';

    export class Request {
        @IsString({ message: "Id чата должен быть строкой" })
        chatId!: string;

        @IsString({ message: "Текст быть строкой" })
        @MaxLength(1000, { message: "Максимальная длина сообщения не должна превышать 1000 символов" })
        text!: string;

        sender!: IChatUser;
    }

    export class Response {
        message!: IAddMessage;
    }
}

export interface IAddMessage extends IMessage {
    chatId: string;
}

