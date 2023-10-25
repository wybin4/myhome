import { IApartment, ISubscriber } from '@myhome/interfaces';
import { IsArray } from 'class-validator';

export namespace ReferenceGetApartmentsBySubscribers {
    export const topic = 'reference.get-apartments-by-subscribers.query';

    export class Request {
        @IsArray({ message: "Id абонентов должны быть массивом чисел" })
        subscriberIds!: number[];
    }

    export class Response {
        apartments!: IGetApartmentsBySubscribers[];
    }
}

interface IGetApartmentsBySubscribers extends IApartment {
    subscriber: ISubscriber;
}