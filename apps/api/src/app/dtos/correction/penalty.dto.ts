import { IsNumber } from "class-validator";

export class AddPenaltyCalculationRuleDto {
    @IsNumber()
    id?: number;

    @IsNumber()
    typeOfServiceId: number;

    @IsNumber()
    managementCompanyId: number;

    @IsNumber()
    penaltyRuleId: number;
}
