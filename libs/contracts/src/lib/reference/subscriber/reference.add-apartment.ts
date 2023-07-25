import { IApartment } from '@myhome/interfaces';
import { IsNumber } from 'class-validator';

export namespace ReferenceAddApartment {
    export const topic = 'reference.add-apartment.command';

    export class Request {
        @IsNumber()
        houseId!: number;

        @IsNumber()
        apartmentNumber!: number;

        @IsNumber()
        totalArea!: number;

        @IsNumber()
        livingArea!: number;
    }

    export class Response {
        apartment!: IApartment;
    }
}
