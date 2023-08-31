import { IGetPublicUtility } from "@myhome/interfaces";
import { IsNumber } from "class-validator";

export namespace GetPublicUtilities {
    export const topic = 'document-detail.get-public-utilities.command';

    export class Request {
        subscriberIds!: number[];

        @IsNumber()
        managementCompanyId!: number;
    }

    export class Response {
        publicUtilities!: IGetPublicUtility[];
    }
}