import { IDocumentDetail } from "@myhome/interfaces";
import { IsNumber } from "class-validator";

export namespace GetPublicUtilities {
    export const topic = 'document-detail.get-public-utilities.command';

    export class Request {
        @IsNumber()
        subscriberIds!: number[];

        @IsNumber()
        managementCompanyId!: number;
    }

    export class Response {
        publicUtilities!: IDocumentDetail[];
    }
}
