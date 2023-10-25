import { IsNumber } from 'class-validator';
import { IHouse } from '@myhome/interfaces';

export namespace ReferenceUpdateHouse {
    export const topic = 'reference.update-house.command';

    export class Request {
        @IsNumber({}, { message: "Id дома должен быть числом" })
        id!: number;

        @IsNumber({}, { message: "Id управляющей компании должен быть числом" })
        managementCompanyId!: number;
    }

    export class Response {
        house!: IHouse;
    }
}
