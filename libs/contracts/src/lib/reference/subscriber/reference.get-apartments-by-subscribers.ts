import { IApartment, ISubscriber } from '@myhome/interfaces';

export namespace ReferenceGetApartmentsBySubscribers {
    export const topic = 'reference.get-apartments-by-subscribers.query';

    export class Request {
        subscriberIds!: number[];
    }

    export class Response {
        apartments!: (IApartment & { subscriber: ISubscriber })[];
    }
}
