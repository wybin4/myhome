import { ICalculatedDebt, ICalculatedPenalty, IGetCorrection } from "@myhome/interfaces";
import { IsArray, IsNumber, IsOptional } from "class-validator";

export namespace GetCorrection {
    export const topic = 'correction.get-correction.query';

    export class Request {
        @IsArray()
        subscriberSPDs!: IGetCorrection[];

        @IsOptional()
        @IsNumber()
        keyRate?: number;
    }

    export class Response {
        debts!: ICalculatedDebt[];
        penalties!: ICalculatedPenalty[];
    }
}
