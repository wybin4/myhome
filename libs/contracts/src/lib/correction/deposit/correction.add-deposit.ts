import { IsNumber } from "class-validator";
import { IDeposit } from "@myhome/interfaces";

export namespace CorrectionAddDeposit {
    export const topic = 'correction.add-deposit.command';

    export class Request {
        @IsNumber()
        singlePaymentDocumentId!: number;

        @IsNumber()
        paymentAmount!: number;

        @IsNumber()
        spdAmount!: number;
    }

    export class Response {
        deposit!: IDeposit;
    }
}
