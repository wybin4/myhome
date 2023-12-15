export namespace CorrectionGetPenaltyRules {
    export const topic = 'correction.get-penalty-rules.query';

    export class Request { }

    export class Response {
        penaltyRules!: IGetPenaltyRule[];
    }
}

export interface IGetPenaltyRule {
    id: string;
    name: string;
    designation: string;
    start: number;
    end: number;
}