import { IsNumber } from 'class-validator';
import { ISubscriber } from '@myhome/interfaces';

export namespace ReferenceGetSubscriber {
    export const topic = 'reference.get-subscriber.query';

    export class Request {
        @IsNumber()
        id!: number;
    }

    export class Response {
        subscriber!: ISubscriber;
    }
}
