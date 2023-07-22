import { IsNumber } from 'class-validator';
import { ISubscriber } from '@myhome/interfaces';

export namespace ReferenceUpdateSubscriber {
    export const topic = 'reference.update-subscriber.command';

    export class Request {
        @IsNumber()
        id!: number;
    }

    export class Response {
        subscriber!: ISubscriber;
    }
}
