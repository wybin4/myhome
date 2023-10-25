import { IsNumber } from "class-validator";

export namespace GetSinglePaymentDocumentsByMCId {
    export const topic = 'single-payment-document.get-single-payment-documents-by-mcid.query';

    export class Request {
        @IsNumber({}, { message: "Id управляющей компании должен быть числом" })
        managementCompanyId!: number;
    }

    export class Response {
        singlePaymentDocuments!: IGetSinglePaymentDocumentsByMCId[];
    }
}

export interface IGetSinglePaymentDocumentsByMCId {
    id: number;
    houseId: number;
    city: string;
    street: string;
    houseName: string;
    fileSize: number;
    pdfBuffer: string;
    createdAt: Date;
}
