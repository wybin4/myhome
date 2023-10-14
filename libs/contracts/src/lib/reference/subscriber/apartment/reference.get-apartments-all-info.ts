import { IApartment } from '@myhome/interfaces';
import { IsArray } from 'class-validator';

export namespace ReferenceGetApartmentsAllInfo {
    export const topic = 'reference.get-apartments-all-info.query';

    export class Request {
        @IsArray()
        subscriberIds!: number[];
    }

    export class Response {
        apartments!: IGetApartmentsAllInfo[];
    }
}

interface IGetApartmentsAllInfo extends IApartment {
    subscriberId: number;
    address: string;
}