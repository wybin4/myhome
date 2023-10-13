import { RequireSubscriberIdsOrHouseIds } from "@myhome/interfaces";
import { IsArray, IsNumber, IsOptional } from "class-validator";

export namespace GetSinglePaymentDocument {
    export const topic = 'single-payment-document.get-single-payment-document.command';

    export class Request {
        @IsOptional()
        @IsArray()
        @RequireSubscriberIdsOrHouseIds()
        subscriberIds?: number[];

        @IsOptional()
        @IsArray()
        @RequireSubscriberIdsOrHouseIds()
        houseIds?: number[];

        @IsNumber()
        managementCompanyId!: number;

        @IsOptional()
        @IsNumber()
        keyRate?: number;
    }

    export class Response {
        pdfBuffer!: string;
    }
}
