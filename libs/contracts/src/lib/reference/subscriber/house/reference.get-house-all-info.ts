import { IsNumber } from 'class-validator';
import { IHouse } from '@myhome/interfaces';

export namespace ReferenceGetHouseAllInfo {
    export const topic = 'reference.get-house-all-info.query';

    export class Request {
        @IsNumber({}, { message: "Id дома должен быть числом" })
        id!: number;
    }

    export class Response {
        house!: IGetHouseAllInfo;
    }
}

export interface IGetHouseAllInfo extends IHouse {
    ownerIds: number[];
    managementCompanyName: string;
}