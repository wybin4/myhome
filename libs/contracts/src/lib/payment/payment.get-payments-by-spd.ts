import { IPayment } from "@myhome/interfaces";
import { IsNumber } from "class-validator";

export namespace GetPaymentsBySpd {
    export const topic = 'payment.get-payments-by-spd.query';

    export class Request {
        @IsNumber({}, { message: "Id ЕПД должен быть числом" })
        singlePaymentDocumentId!: number;
    }

    export class Response {
        payments!: IPayment[];
    }
}
