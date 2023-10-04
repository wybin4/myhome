import { IApartment } from '@myhome/interfaces';
import { IsNumber } from 'class-validator';

export namespace ReferenceGetApartmentsByMCId {
    export const topic = 'reference.get-apartments-by-mcid.query';

    export class Request {
        @IsNumber()
        managementCompanyId!: number;
    }

    export class Response {
        apartments!: IGetApartmentsByMCId[];
    }
}

export interface IGetApartmentsByMCId extends IApartment {
    houseName: string;
}