import { IsArray } from "class-validator";

export namespace CorrectionCalculateDebts {
    export const topic = 'correction.calculate-debts.query';

    export class Request {
        @IsArray()
        subscriberSPDs!: ICalculateDebtsRequest[];
    }

    export class Response {
        debts!: ICalculateDebtsResponse[];
    }
}

export interface ICalculateDebtsRequest {
    subscriberId: number;
    spdIds: number[];
}

export interface ICalculateDebtsResponse {
    subscriberId: number;
    debt: number
}