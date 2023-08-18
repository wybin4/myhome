import { ICalculatedDebt, ICalculatedPenalty, IGetCorrection } from "@myhome/interfaces";

export namespace GetCorrection {
    export const topic = 'correction.get-correction.query';

    export class Request {
        subscriberSPDs!: IGetCorrection[]
    }

    export class Response {
        debts!: ICalculatedDebt[];
        penalties!: ICalculatedPenalty[];
    }
}
