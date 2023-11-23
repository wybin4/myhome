import { IsNumber } from "class-validator";
import { IDeposit } from "@myhome/interfaces";

export namespace CorrectionAddDeposit {
    export const topic = 'correction.add-deposit.command';

    export class Request {
        @IsNumber({}, { message: "Id ЕПД должен быть числом" })
        singlePaymentDocumentId!: number;

        @IsNumber({}, { message: "Сумма платежа должна быть числом" })
        paymentAmount!: number;

        @IsNumber({}, { message: "Сумма ЕПД должна быть числом" })
        spdAmount!: number;
    }

    export class Response {
        deposit!: IDeposit;
    }
}
