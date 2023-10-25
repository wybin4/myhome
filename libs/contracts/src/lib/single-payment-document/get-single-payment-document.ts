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

        @IsNumber({}, { message: "Id управляющей компании должен быть числом" })
        managementCompanyId!: number;

        @IsOptional()
        @IsNumber({}, { message: "Ключевая ставка должна быть числом" })
        keyRate?: number;
    }

    export class Response {
        pdfBuffer!: string;
    }
}
