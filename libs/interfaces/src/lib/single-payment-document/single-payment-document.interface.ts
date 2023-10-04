export interface ISinglePaymentDocument {
    id?: number;
    managementCompanyId: number;
    subscriberId: number;
    amount?: number;
    debt?: number;
    penalty?: number;
    deposit?: number;
    createdAt: Date;
    status: CalculationState;
}

export enum CalculationState {
    Started = 'Started',
    DetailsCalculated = 'DetailsCalculated',
    CorrectionsCalculated = 'CorrectionsCalculated',
    Cancelled = 'Cancelled',
}