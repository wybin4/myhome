import { IsNumber } from "class-validator";

export namespace CorrectionGetPenaltyCalculationRulesByMCId {
    export const topic = 'correction.get-penalty-calculation-rules-by-mcid.query';

    export class Request {
        @IsNumber()
        managementCompanyId!: number;
    }

    export class Response {
        penaltyRules!: IGetPenaltyCalculationRulesByMCId[];
    }
}

export interface IGetPenaltyCalculationRulesByMCId {
    penaltyRuleId: string;
    description: string;
    typeOfServiceName: string;
    typeOfServiceId: number;
    priority: number;
}