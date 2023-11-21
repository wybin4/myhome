export class AddPenaltyCalculationRuleDto {
    id?: number;
    typeOfServiceIds!: number[];
    penaltyRuleId!: string;
    priority!: number;
}

export class GetPenaltyCalculationRulesByMCIdDto { }
