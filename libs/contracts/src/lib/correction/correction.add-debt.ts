import { IDebt } from "@myhome/interfaces";
import { IsArray, IsNumber } from "class-validator";

export namespace CorrectionAddDebt {
    export const topic = 'correction.add-debt.command';

    export class Request {
        @IsNumber()
        singlePaymentDocumentId!: number;

        @IsNumber()
        paymentAmount!: number;

        @IsArray()
        spdAmount!: ICorrectionAddDebt[];
    }

    export class Response {
        debt!: IDebt;
    }
}

export interface ICorrectionAddDebt {
    typeOfServiceId: number;
    amount: number;
}