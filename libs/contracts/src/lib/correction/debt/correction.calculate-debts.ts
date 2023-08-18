import { ICalculatedDebt, IGetCorrection } from "@myhome/interfaces";
import { IsArray } from "class-validator";

export namespace CorrectionCalculateDebts {
    export const topic = 'correction.calculate-debts.query';

    export class Request {
        @IsArray()
        subscriberSPDs!: IGetCorrection[];
    }

    export class Response {
        debts!: ICalculatedDebt[];
    }
}
