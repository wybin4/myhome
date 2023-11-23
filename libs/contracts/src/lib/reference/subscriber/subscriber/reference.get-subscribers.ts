import { IsArray, IsBoolean } from 'class-validator';
import { ISubscriber } from '@myhome/interfaces';

export namespace ReferenceGetSubscribers {
    export const topic = 'reference.get-subscribers.query';

    export class Request {
        @IsArray({ message: "Id абонентов должны быть массивом чисел" })
        ids!: number[];

        @IsBoolean({ message: "Флаг должен быть правдой или ложью" })
        isAllInfo!: boolean;
    }

    export class Response {
        subscribers!: ISubscriber[] | ISubscriberAllInfo[];
    }
}

export interface ISubscriberAllInfo {
    id: number;
    houseId: number;
    name: string;
    address: string;
    personalAccount: string;
    apartmentArea: number;
    livingArea: number;
    numberOfRegistered: number;
}