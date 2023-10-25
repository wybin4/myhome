import { IsNumber } from 'class-validator';
import { ISubscriber } from '@myhome/interfaces';

export namespace ReferenceGetSubscribersByMCId {
    export const topic = 'reference.get-subscribers-by-mcid.query';

    export class Request {
        @IsNumber({}, { message: "Id управляющей компании должен быть числом" })
        managementCompanyId!: number;
    }

    export class Response {
        subscribers!: IGetSubscribersByMCId[];
    }
}

export interface IGetSubscribersByMCId extends ISubscriber {
    ownerName: string;

    houseId: number;
    houseName: string;
    apartmentName: string;
}