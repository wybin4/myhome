import { IsNumber } from 'class-validator';
import { IHouse } from '@myhome/interfaces';

export namespace ReferenceGetHousesByOwner {
    export const topic = 'reference.get-houses-by-owner.query';

    export class Request {
        @IsNumber({}, { message: "Id владельца должен быть числом" })
        ownerId!: number;
    }

    export class Response {
        houses!: IHouse[];
    }
}
