import { RequireHomeOrManagementCompany } from "@myhome/interfaces";
import { IsArray, IsNumber, IsOptional } from "class-validator";

export namespace GetSinglePaymentDocument {
    export const topic = 'single-payment-document.get-single-payment-document.command';

    export class Request {
        @IsArray()
        subscriberIds!: number[];

        @RequireHomeOrManagementCompany()
        managementCompanyId?: number;

        @RequireHomeOrManagementCompany()
        houseId?: number;

        @IsOptional()
        @IsNumber()
        keyRate?: number;
    }

    export class Response {
        pdfBuffer!: string;
    }
}
