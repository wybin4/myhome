import { IsNumber } from "class-validator";

export namespace CorrectionGetDebts {
    export const topic = 'correction.get-debts.query';

    export class Request {
        @IsNumber({}, { message: "Id владельца должен быть числом" })
        userId!: number;
    }

    export class Response {
        debts!: IGetDebt[];
    }
}

export interface IGetDebt {
    id: number;
    outstandingDebt: number;
    createdAt: Date;
    apartmentName: string;
}
