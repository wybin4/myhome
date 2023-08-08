import { IPenalty } from "@myhome/interfaces";
import { IsArray } from "class-validator";

export namespace CorrectionGetPenalty {
    export const topic = 'correction.get-penalty.query';


    export class Request {
        @IsArray()
        subscriberIds!: number[];
    }

    export class Response {
        penalties!: IPenalty[];
    }
}
