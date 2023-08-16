import { IDeposit } from "@myhome/interfaces";
import { IsNumber } from "class-validator";

export namespace CorrectionGetDeposit {
    export const topic = 'correction.get-deposit.query';

    export class Request {
        @IsNumber()
        id!: number;
    }

    export class Response {
        deposit!: IDeposit;
    }
}
