import { IPenaltyCalculationRule } from "@myhome/interfaces";
import { IsArray, IsNumber, IsString } from "class-validator";

export namespace CorrectionAddPenaltyCalculationRule {
    export const topic = 'correction.add-penalty-calculation-rule.command';

    export class Request {
        @IsArray()
        typeOfServiceIds!: number[];

        @IsNumber()
        managementCompanyId!: number;

        @IsString()
        penaltyRuleId!: string;

        @IsNumber()
        priority!: number;
    }

    export class Response {
        penaltyCalculationRule!: IPenaltyCalculationRule;
    }
}
