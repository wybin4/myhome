import { IDebt } from "@myhome/interfaces";
import { IsNumber, IsOptional } from "class-validator";

export namespace CorrectionUpdateDebt {
    export const topic = 'correction.update-debt.command';

    export class Request {
        @IsNumber({}, { message: "Id ЕПД должен быть числом" })
        singlePaymentDocumentId!: number;

        @IsNumber({}, { message: "Id управляющей компании должен быть числом" })
        managementCompanyId!: number;

        @IsNumber({}, { message: "Сумма платежа должна быть числом" })
        amount!: number;

        @IsOptional()
        @IsNumber({}, { message: "Ключевая ставка должна быть числом" })
        keyRate?: number;
    }

    export class Response {
        debt!: IDebt;
    }
}
