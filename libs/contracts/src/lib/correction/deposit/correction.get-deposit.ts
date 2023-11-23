import { ICalculatedDeposit, IGetCorrection } from "@myhome/interfaces";
import { IsArray } from "class-validator";

export namespace CorrectionGetDeposit {
    export const topic = 'correction.get-deposit.query';

    export class Request {
        @IsArray()
        subscriberSPDs!: IGetCorrection[];
    }

    export class Response {
        deposits!: ICalculatedDeposit[];
    }
}