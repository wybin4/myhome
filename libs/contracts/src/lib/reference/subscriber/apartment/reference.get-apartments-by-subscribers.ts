import { IApartment, ISubscriber } from '@myhome/interfaces';
import { IsArray, IsBoolean } from 'class-validator';

export namespace ReferenceGetApartmentsBySubscribers {
    export const topic = 'reference.get-apartments-by-subscribers.query';

    export class Request {
        @IsArray({ message: "Id абонентов должны быть массивом чисел" })
        subscriberIds!: number[];

        @IsBoolean({ message: "Флаг должен быть правдой или ложью" })
        isAllInfo!: boolean;
    }

    export class Response {
        apartments!: IGetApartmentsWithSubscriber[] | IGetApartmentAllInfo[];
    }
}

export interface IGetApartmentsWithSubscriber extends IApartment {
    subscriber: ISubscriber;
}

export interface IGetApartmentAllInfo extends IApartment {
    subscriberId: number;
    address: string;
}