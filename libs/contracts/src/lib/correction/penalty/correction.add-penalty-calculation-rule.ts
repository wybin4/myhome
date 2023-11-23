import { IPenaltyCalculationRule } from "@myhome/interfaces";
import { IsArray, IsNumber, IsString } from "class-validator";

export namespace CorrectionAddPenaltyCalculationRule {
    export const topic = 'correction.add-penalty-calculation-rule.command';

    export class Request {
        @IsArray({message: "Id типов услуг должны быть массивом чисел"})
        typeOfServiceIds!: number[];

        @IsNumber({}, { message: "Id управляющей компании должен быть числом" })
        managementCompanyId!: number;

        @IsString({ message: "Id правила начисления пени должен быть строкой" })
        penaltyRuleId!: string;

        @IsNumber({}, { message: "Приоритет должен быть числом" })
        priority!: number;
    }

    export class Response {
        penaltyCalculationRule!: IPenaltyCalculationRule;
    }
}
