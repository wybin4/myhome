import { IsNumber } from 'class-validator';
import { IGetChatUser } from '@myhome/interfaces';

export namespace ReferenceGetReceiversByOwner {
    export const topic = 'reference.get-receivers-by-owner.query';

    export class Request {
        @IsNumber({}, { message: "Id владельца должно быть числом" })
        ownerId!: number;
    }

    export class Response {
        receivers!: IGetChatUser[];
    }
}

