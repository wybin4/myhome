import { IChat } from '@myhome/interfaces';
import { IsNumber } from 'class-validator';

export namespace AppealAddChat {
    export const topic = 'appeal.add-chat.command';

    export class Request {
        @IsNumber()
        appealId!: number;
    }

    export class Response {
        chat!: IChat;
    }
}

