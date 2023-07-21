import { IsNumber } from 'class-validator';
import { IApartment } from '@myhome/interfaces';

export namespace ReferenceGetApartment {
    export const topic = 'reference.get-apartment.query';

    export class Request {
        @IsNumber()
        id!: number;
    }

    export class Response {
        apartment!: IApartment;
    }
}
