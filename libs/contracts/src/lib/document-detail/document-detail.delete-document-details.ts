import { IsArray } from "class-validator";

export namespace DeleteDocumentDetails {
    export const topic = 'document-detail.delete-document-details.command';

    export class Request {
        @IsArray({ message: "Id деталей ЕПД должны быть массивом чисел" })
        detailIds!: number[];
    }

    export class Response { }
}
