import { IsNumber } from 'class-validator';
import { IHouse } from '@myhome/interfaces';

export namespace ReferenceGetHouse {
    export const topic = 'reference.get-house.query';

    export class Request {
        @IsNumber({}, { message: "Id дома должен быть числом" })
        id!: number;
    }

    export class Response {
        house!: IHouse;
    }
}
