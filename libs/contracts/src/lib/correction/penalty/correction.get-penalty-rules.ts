export namespace CorrectionGetPenaltyRules {
    export const topic = 'correction.get-penalty-rules.query';

    export class Request { }

    export class Response {
        penaltyRules!: {
            id: string;
            name: string;
        }[];
    }
}