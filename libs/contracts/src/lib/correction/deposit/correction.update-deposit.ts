import { IsArray } from "class-validator";
import { IGetCorrection } from "@myhome/interfaces";

export namespace CorrectionUpdateDeposit {
    export const topic = 'correction.update-deposit.command';

    export class Request {
        @IsArray()
        subscriberSPDs!: IGetCorrection;
    }

    export class Response { }
}
