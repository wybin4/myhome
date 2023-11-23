import { ISinglePaymentDocument } from "@myhome/interfaces";
import { IsNumber } from "class-validator";

export namespace CheckSinglePaymentDocument {
    export const topic = 'single-payment-document.check-single-payment-document.query';

    export class Request {
        @IsNumber({}, { message: "Id ЕПД должен быть числом" })
        id!: number;
    }

    export class Response {
        singlePaymentDocument!: ISinglePaymentDocument;
    }
}
