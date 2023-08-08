import { IsArray } from "class-validator";

export namespace DeleteDocumentDetails {
    export const topic = 'document-detail.delete-document-details.command';

    export class Request {
        @IsArray()
        detailIds!: number[];
    }

    export class Response { }
}
