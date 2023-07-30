import { IDocumentDetail } from "@myhome/interfaces";
import { IsNumber } from "class-validator";

export namespace GetDocumentDetail {
    export const topic = 'document-detail.get-document-detail.command';

    export class Request {
        @IsNumber()
        subscriberIds!: number[];
    }

    export class Response {
        commonHouseNeeds!: IDocumentDetail[];
    }
}
