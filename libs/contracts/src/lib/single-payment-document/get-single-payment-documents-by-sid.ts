import { IsArray } from "class-validator";

export namespace GetSinglePaymentDocumentsBySId {
    export const topic = 'single-payment-document.get-single-payment-documents-by-sid.query';

    export class Request {
        @IsArray({ message: "Id абонентов должны быть массивом чисел" })
        subscriberIds!: number[];
    }

    export class Response {
        singlePaymentDocuments!: IGetSinglePaymentDocumentsBySId[];
    }
}

export interface IGetSinglePaymentDocumentsBySId {
    id: number;
    apartmentName: string;
    fileSize: number;
    pdfBuffer: string;
    createdAt: Date;
}
