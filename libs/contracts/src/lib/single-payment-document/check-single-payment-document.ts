import { ISinglePaymentDocument } from "@myhome/interfaces";
import { IsNumber } from "class-validator";

export namespace CheckSinglePaymentDocument {
    export const topic = 'single-payment-document.check-single-payment-document.command';

    export class Request {
        @IsNumber()
        id!: number;
    }

    export class Response {
        singlePaymentDocument!: ISinglePaymentDocument[];
    }
}
