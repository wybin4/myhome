import { IDeposit } from "@myhome/interfaces";
import { IsArray } from "class-validator";

export namespace CorrectionGetDeposit {
    export const topic = 'correction.get-deposit.query';

    export class Request {
        @IsArray()
        subscriberIds!: number[];
    }

    export class Response {
        deposits!: IDeposit[];
    }
}
