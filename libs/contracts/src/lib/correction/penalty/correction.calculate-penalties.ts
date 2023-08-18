import { ICalculatedPenalty, IGetCorrection } from "@myhome/interfaces";
import { IsArray } from "class-validator";

export namespace CorrectionCalculatePenalties {
    export const topic = 'correction.calculate-penalties.query';

    export class Request {
        @IsArray()
        subscriberSPDs!: IGetCorrection[];
    }

    export class Response {
        penalties!: ICalculatedPenalty[];
    }
}
