import { IGetPublicUtility } from "@myhome/interfaces";
import { IsArray, IsNumber } from "class-validator";

export namespace GetPublicUtilities {
    export const topic = 'document-detail.get-public-utilities.command';

    export class Request {
        @IsArray({ message: "Id абонентов должны быть массивом чисел" })
        subscriberIds!: number[];

        @IsNumber({}, { message: "Id управляющей компании должен быть числом" })
        managementCompanyId!: number;
    }

    export class Response {
        publicUtilities!: IGetPublicUtility[];
    }
}