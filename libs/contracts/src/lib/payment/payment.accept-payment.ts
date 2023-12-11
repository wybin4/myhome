import { IPayment } from "@myhome/interfaces";
import { IsNumber } from "class-validator";

export namespace AcceptPayment {
    export const topic = 'payment.accept-payment.command';

    export class Request {
        @IsNumber({}, { message: "Id ЕПД должен быть числом" })
        singlePaymentDocumentId!: number;

        @IsNumber({}, { message: "Сумма платежа должна быть числом" })
        amount!: number;
    }

    export class Response {
        payment!: IPayment;
    }
}
