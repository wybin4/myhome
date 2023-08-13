import { IDebt } from "@myhome/interfaces";
import { IsNumber } from "class-validator";

export namespace CorrectionUpdateDebt {
    export const topic = 'correction.update-debt.command';

    export class Request {
        @IsNumber()
        singlePaymentDocumentId!: number;

        @IsNumber()
        amount!: number;
    }

    export class Response {
        debt!: IDebt;
    }
}
