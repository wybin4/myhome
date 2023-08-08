import { IDebt } from "@myhome/interfaces";
import { IsArray } from "class-validator";

export namespace CorrectionGetDebt {
    export const topic = 'correction.get-debt.query';

    export class Request {
        @IsArray()
        subscriberIds!: number[];
    }

    export class Response {
        debts!: IDebt[];
    }
}
