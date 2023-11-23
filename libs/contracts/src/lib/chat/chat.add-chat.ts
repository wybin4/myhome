import { IChat, IChatUser } from '@myhome/interfaces';
import { IsArray } from 'class-validator';

export namespace AddChat {
    export const topic = 'chat.add-chat.command';

    export class Request {
        @IsArray({ message: "Пользователи должны быть массивом" })
        users!: IChatUser[];
    }

    export class Response {
        chat!: IChat;
    }
}

