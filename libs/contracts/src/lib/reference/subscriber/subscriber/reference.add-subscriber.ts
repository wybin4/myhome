import { ISubscriber, SubscriberStatus } from '@myhome/interfaces';
import { IsNumber, IsString } from 'class-validator';

export namespace ReferenceAddSubscriber {
    export const topic = 'reference.add-subscriber.command';

    export class Request {
        @IsNumber()
        ownerId!: number;

        @IsNumber()
        apartmentId!: number;

        @IsString()
        personalAccount!: string;

        @IsString()
        status!: SubscriberStatus;
    }

    export class Response {
        subscriber!: ISubscriber;
    }
}
