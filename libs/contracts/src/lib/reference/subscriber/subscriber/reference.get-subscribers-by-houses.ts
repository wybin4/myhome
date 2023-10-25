import { IHouse, ISubscriberAllInfo } from '@myhome/interfaces';
import { IsArray } from 'class-validator';

export namespace ReferenceGetSubscribersByHouses {
    export const topic = 'reference.get-subscribers-by-houses.query';

    export class Request {
        @IsArray({ message: "Id домов должны быть массивом чисел" })
        houseIds!: number[];
    }

    export class Response {
        houses!: IGetSubscribersByHouse[];
    }
}

interface IGetSubscribersByHouse {
    house: IHouse;
    subscribers: ISubscriberAllInfo[];
}