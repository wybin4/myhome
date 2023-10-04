import { IsArray } from 'class-validator';

export namespace ReferenceGetMetersAllInfoBySID {
    export const topic = 'reference.get-meters-all-info-by-sid.query';

    export class Request {
        @IsArray()
        subscriberIds!: number[];
    }

    export class Response {
        meters!: IGetMeterByAIDs[];
    }
}

export interface IGetMeterByAIDs {
    apartmentId: number;
    apartmentFullAddress: string;
    apartmentNumber: number;

    meters: IGetMeterByAID[];
}

export interface IGetMeterByAID {
    id: number;
    typeOfServiceId: number;
    typeOfServiceName: string;
    unitName: string;
    readings: {
        current: number;
        previous: number;
        previousReadAt: Date;
    }
    factoryNumber: string;
    verifiedAt: Date;
    issuedAt: Date;
}