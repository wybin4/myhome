import { IHouse } from '@myhome/interfaces';
import { IsNumber, IsString } from 'class-validator';

export namespace ReferenceAddHouse {
    export const topic = 'reference.add-house.command';

    export class Request {
        @IsNumber()
        managementCompanyId!: number;

        @IsString()
        city!: string;

        @IsString()
        street!: string;

        @IsString()
        houseNumber!: string;
    }

    export class Response {
        house!: IHouse;
    }
}
