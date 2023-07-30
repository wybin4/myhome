import { IDocumentDetail, RequireHomeOrManagementCompany } from "@myhome/interfaces";
import { IsNumber } from "class-validator";

export namespace GetDocumentDetail {
    export const topic = 'document-detail.get-document-detail.command';

    export class Request {
        @IsNumber()
        subscriberIds!: number[];

        @RequireHomeOrManagementCompany()
        managementCompanyId?: number;

        @RequireHomeOrManagementCompany()
        houseId?: number;
    }

    export class Response {
        commonHouseNeeds!: IDocumentDetail[];
    }
}
