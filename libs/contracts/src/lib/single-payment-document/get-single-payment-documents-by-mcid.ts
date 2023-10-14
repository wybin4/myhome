import { IsNumber } from "class-validator";

export namespace GetSinglePaymentDocumentsByMCId {
    export const topic = 'single-payment-document.get-single-payment-documents-by-mcid.query';

    export class Request {
        @IsNumber()
        managementCompanyId!: number;
    }

    export class Response {
        singlePaymentDocuments!: IGetSinglePaymentDocumentsByMCId[];
    }
}

export interface IGetSinglePaymentDocumentsByMCId {
    houseId: number;
    houseName: string;
    fileSize: number;
    pdfBuffer: string;
    createdAt: Date;
}
