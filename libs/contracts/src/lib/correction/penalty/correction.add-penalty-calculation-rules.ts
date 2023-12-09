import { IPenaltyCalculationRule } from "@myhome/interfaces";
import { ArrayMinSize, IsDefined, IsNumber, IsString } from "class-validator";
import { ValidateNestedArray } from "../../array.validator";
import { ParseInt } from "../../parse.validator";

export namespace CorrectionAddPenaltyCalculationRules {
    export const topic = 'correction.add-penalty-calculation-rule.command';

    export class AddPenaltyCalculationRulesValidator {
        @IsNumber({}, { message: "Id типа услуги должен быть числом" })
        typeOfServiceId!: number[];

        @IsString({ message: "Id правила начисления пени должен быть строкой" })
        penaltyRuleId!: string;

        @ParseInt({ message: "Приоритет должен быть числом" })
        priority!: number;
    }

    export class Request {
        @IsDefined({ message: "Массив правил должен существовать" })
        @ArrayMinSize(1, { message: "Массив правил не должен быть пустым" })
        @ValidateNestedArray(AddPenaltyCalculationRulesValidator)
        penaltyRules!: IAddPenaltyCalculationRules[];

        @IsNumber({}, { message: "Id управляющей компании должен быть числом" })
        managementCompanyId!: number;
    }

    export class Response {
        penaltyRules!: IPenaltyCalculationRule[];
    }
}

export interface IAddPenaltyCalculationRules {
    typeOfServiceId: number;
    penaltyRuleId: string;
    priority: number;
}