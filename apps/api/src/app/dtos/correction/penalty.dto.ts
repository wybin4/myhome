import { IsArray, IsNumber, IsString } from "class-validator";

export class AddPenaltyCalculationRuleDto {
    @IsNumber()
    id?: number;

    @IsArray()
    typeOfServiceIds!: number[];

    @IsNumber()
    @IsNumber({}, { message: "Id управляющей компании должен быть числом" })
    managementCompanyId!: number;

    @IsString()
    penaltyRuleId!: string;

    @IsNumber()
    priority!: number;
}

export class GetPenaltyCalculationRulesByMCIdDto {
    @IsNumber()
    managementCompanyId: number;
}
