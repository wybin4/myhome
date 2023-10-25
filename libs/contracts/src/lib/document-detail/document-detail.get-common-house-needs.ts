import { IGetCommonHouseNeed } from "@myhome/interfaces";
import { IsArray, IsNumber } from "class-validator";

export namespace GetCommonHouseNeeds {
    export const topic = 'document-detail.get-common-house-needs.command';

    export class Request {
        @IsArray({ message: "Id абонентов должны быть массивом чисел" })
        subscriberIds!: number[];

        @IsNumber({}, { message: "Id дома должен быть числом" })
        houseId!: number;
    }

    export class Response {
        commonHouseNeeds!: IGetCommonHouseNeed[];
    }
}