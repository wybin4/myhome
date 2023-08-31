export interface ISinglePaymentDocument {
    id?: number;
    managementCompanyId: number;
    subscriberId: number;
    amount?: number;
    debt?: number;
    penalty?: number;
    deposit?: number;
    createdAt: Date;
}

export enum CalculationState {
    Started = 'Started',
    DetailsCalculated = 'DetailsCalculated',
    CorrectionsCalculated = 'CorrectionsCalculated',
    Calculated = 'Calculated',
    Cancelled = 'Cancelled',
}