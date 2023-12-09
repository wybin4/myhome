import { IDebt } from "@myhome/interfaces";
import { ArrayMinSize, IsArray, IsDefined, IsNumber } from "class-validator";
import { ValidateNestedArray } from "../../array.validator";

export namespace CorrectionAddDebts {
    export const topic = 'correction.add-debts.command';

    export class AddDebtsValidator {
        @IsNumber({}, { message: "Id ЕПД должен быть числом" })
        singlePaymentDocumentId!: number;

        @IsArray()
        spdAmount!: ISPDAmount[];
    }

    export class Request {
        @IsDefined({ message: "Массив ЕПД должен существовать" })
        @ArrayMinSize(1, { message: "Массив ЕПД не должен быть пустым" })
        @ValidateNestedArray(AddDebtsValidator)
        spds!: IAddDebt[];

        @IsNumber({}, { message: "Id управляющей компании должен быть числом" })
        managementCompanyId!: number;
    }

    export class Response {
        debts!: IDebt[];
    }
}

export interface ISPDAmount {
    typeOfServiceId: number;
    amount: number;
}

export interface IAddDebt {
    singlePaymentDocumentId: number;
    spdAmount: ISPDAmount[];
}