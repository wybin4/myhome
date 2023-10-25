import { IDocumentDetail } from "@myhome/interfaces";
import { IsArray } from "class-validator";

export namespace AddDocumentDetails {
    export const topic = 'document-detail.add-document-details.command';

    export class Request {
        @IsArray({ message: "Детали ЕПД должны быть массивом" })
        details!: IDocumentDetail[];
    }

    export class Response {
        detailIds!: number[];
    }
}
