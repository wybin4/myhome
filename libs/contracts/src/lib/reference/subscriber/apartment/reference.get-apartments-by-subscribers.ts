import { IApartment, ISubscriber } from '@myhome/interfaces';
import { IsArray } from 'class-validator';

export namespace ReferenceGetApartmentsBySubscribers {
    export const topic = 'reference.get-apartments-by-subscribers.query';

    export class Request {
        @IsArray()
        subscriberIds!: number[];
    }

    export class Response {
        apartments!: (IApartment & { subscriber: ISubscriber })[];
    }
}
