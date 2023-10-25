import { IsArray } from 'class-validator';
import { ISubscriber } from '@myhome/interfaces';

export namespace ReferenceGetSubscribers {
    export const topic = 'reference.get-subscribers.query';

    export class Request {
        @IsArray({ message: "Id абонентов должны быть массивом чисел" })
        ids!: number[];
    }

    export class Response {
        subscribers!: ISubscriber[];
    }
}
