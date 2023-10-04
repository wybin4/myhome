import { IsNumber } from 'class-validator';

export namespace ReferenceGetSubscribersByHouse {
    export const topic = 'reference.get-subscribers-by-house.query';

    export class Request {
        @IsNumber()
        houseId!: number;
    }

    export class Response {
        subscriberIds!: number[];
    }
}
