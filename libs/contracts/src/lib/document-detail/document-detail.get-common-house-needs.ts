import { IsNumber } from "class-validator";

export namespace GetCommonHouseNeeds {
    export const topic = 'document-detail.get-common-house-needs.command';

    export class Request {
        subscriberIds!: number[];

        @IsNumber()
        houseId!: number;
    }

    export class Response {
        commonHouseNeeds!: IGetCommonHouseNeed[];
    }
}

export interface IGetCommonHouseNeed {
    subscriberId: number;
    commonHouseNeeds: [
        {
            tariff: number,
            commonHouseNeed: number,
            typeOfServiceId: number
        }
    ]
}