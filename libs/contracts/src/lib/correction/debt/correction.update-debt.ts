import { IDebt } from "@myhome/interfaces";
import { IsNumber, IsOptional } from "class-validator";

export namespace CorrectionUpdateDebt {
    export const topic = 'correction.update-debt.command';

    export class Request {
        @IsNumber()
        singlePaymentDocumentId!: number;

        @IsNumber()
        managementCompanyId!: number;

        @IsNumber()
        amount!: number;

        @IsOptional()
        @IsNumber()
        keyRate?: number;
    }

    export class Response {
        debt!: IDebt;
    }
}
