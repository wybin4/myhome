import { IDebt } from "@myhome/interfaces";
import { IsString } from "class-validator";

export namespace CorrectionGetDebt {
    export const topic = 'correction.get-debt.query';

    export class Request {
        @IsString()
        id!: string;
    }

    export class Response {
        debt!: IDebt;
    }
}
