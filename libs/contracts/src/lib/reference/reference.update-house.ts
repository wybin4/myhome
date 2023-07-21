import { IsNumber } from 'class-validator';
import { IHouse } from '@myhome/interfaces';

export namespace ReferenceUpdateHouse {
    export const topic = 'reference.update-house.command';

    export class Request {
        @IsNumber()
        id!: number;

        @IsNumber()
        managementCompanyId!: number;
    }

    export class Response {
        house!: IHouse;
    }
}
