export interface IPenalty {
    id?: number;
    singlePaymentDocumentId: number;
    originalPenalty: number;
    outstandingPenalty: number;
    createdAt: Date;
}

export interface IPenaltyRule {
    _id?: string;
    description: string;
    penaltyRule: IPenaltyRuleDetail[];
}

export interface IPenaltyRuleDetail {
    divider: number;
    designation: string;
    start: number;
    end: number;
}

export interface IPenaltyCalculationRule {
    id?: number;
    typeOfServiceId: number;
    managementCompanyId: number;
    penaltyRuleId: string;
}