import { IsNumber } from 'class-validator';

export namespace ReferenceGetSubscriberIdsByHouse {
    export const topic = 'reference.get-subscriber-ids-by-house.query';

    export class Request {
        @IsNumber()
        houseId!: number;
    }

    export class Response {
        subscriberIds!: number[];
    }
}
