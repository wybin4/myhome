import { IDebt } from "@myhome/interfaces";
import { IsArray, IsNumber } from "class-validator";

export namespace CorrectionAddDebt {
    export const topic = 'correction.add-debt.command';

    export class Request {
        @IsNumber({}, { message: "Id ЕПД должен быть числом" })
        singlePaymentDocumentId!: number;

        @IsNumber({}, { message: "Сумма платежа должна быть числом" })
        paymentAmount!: number;

        @IsArray()
        spdAmount!: ICorrectionAddDebt[];

        @IsNumber({}, { message: "Id управляющей компании должен быть числом" })
        managementCompanyId!: number;
    }

    export class Response {
        debt!: IDebt;
    }
}

export interface ICorrectionAddDebt {
    typeOfServiceId: number;
    amount: number;
}