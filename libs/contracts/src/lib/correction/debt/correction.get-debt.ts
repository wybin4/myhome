import { IsNumber } from "class-validator";

export namespace CorrectionGetDebts {
    export const topic = 'correction.get-debts.query';

    export class Request {
        @IsNumber({}, { message: "Id владельца должен быть строкой" })
        ownerId!: number;
    }

    export class Response {
        debts!: IGetDebt[];
    }
}

export interface IGetDebt {
    singlePaymentDocumentId: number;
    originalDebt: number;
    outstandingDebt: number;
}
