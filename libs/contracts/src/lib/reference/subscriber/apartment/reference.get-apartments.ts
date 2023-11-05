import { IApartment } from '@myhome/interfaces';
import { IsArray } from 'class-validator';

export namespace ReferenceGetApartments {
    export const topic = 'reference.get-apartments.query';

    export class Request {
        @IsArray({ message: "Id квартир должны быть массивом чисел" })
        ids!: number[];
    }

    export class Response {
        apartments!: IApartment[];
    }
}