import { IsNumber } from 'class-validator';
import { IHouse } from '@myhome/interfaces';

export namespace ReferenceGetHousesByMCId {
    export const topic = 'reference.get-houses-by-mcid.query';

    export class Request {
        @IsNumber()
        managementCompanyId!: number;
    }

    export class Response {
        houses!: IHouse[];
    }
}
