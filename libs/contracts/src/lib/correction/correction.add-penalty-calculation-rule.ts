import { IPenaltyCalculationRule } from "@myhome/interfaces";
import { IsNumber } from "class-validator";

export namespace CorrectionAddPenaltyCalculationRule {
    export const topic = 'correction.add-penalty-calculation-rule.command';

    export class Request {
        @IsNumber()
        typeOfServiceId!: number;

        @IsNumber()
        managementCompanyId!: number;

        @IsNumber()
        penaltyRuleId!: number;
    }

    export class Response {
        penaltyCalculationRule!: IPenaltyCalculationRule;
    }
}
