import { IsArray } from 'class-validator';
import { IHouse } from '@myhome/interfaces';

export namespace ReferenceGetHouses {
    export const topic = 'reference.get-houses.query';

    export class Request {
        @IsArray()
        houseIds!: number[];
    }

    export class Response {
        houses!: IHouse[];
    }
}
