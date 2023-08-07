import { ISinglePaymentDocument, RequireHomeOrManagementCompany } from "@myhome/interfaces";
import { IsArray } from "class-validator";

export namespace GetSinglePaymentDocument {
    export const topic = 'document-detail.get-single-payment-document.command';

    export class Request {
        @IsArray()
        subscriberIds!: number[];

        @RequireHomeOrManagementCompany()
        managementCompanyId?: number;

        @RequireHomeOrManagementCompany()
        houseId?: number;
    }

    export class Response {
        singlePaymentDocument!: ISinglePaymentDocument[];
    }
}
