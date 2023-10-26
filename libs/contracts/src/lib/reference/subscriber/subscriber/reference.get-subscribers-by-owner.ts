import { IsNumber } from 'class-validator';
import { ISubscriber, } from '@myhome/interfaces';

export namespace ReferenceGetSubscribersByOwner {
    export const topic = 'reference.get-subscribers-by-owner.query';

    export class Request {
        @IsNumber({}, { message: "Id владельца должно быть числом" })
        ownerId!: number;
    }

    export class Response {
        subscribers!: ISubscriber[];
    }
}

