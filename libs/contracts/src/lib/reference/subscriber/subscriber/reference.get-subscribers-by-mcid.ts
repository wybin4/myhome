import { IsNumber } from 'class-validator';
import { ISubscriber } from '@myhome/interfaces';

export namespace ReferenceGetSubscribersByMCId {
    export const topic = 'reference.get-subscribers-by-mcid.query';

    export class Request {
        @IsNumber()
        managementCompanyId!: number;
    }

    export class Response {
        subscribers!: ISubscriber[];
    }
}

export interface IGetSubscribersByMCId extends ISubscriber {
    ownerName: string;
    apartmentName: string;
}