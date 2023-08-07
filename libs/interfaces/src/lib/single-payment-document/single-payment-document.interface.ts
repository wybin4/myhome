export interface ISinglePaymentDocument {
    id?: number;
    managementCompanyId: number;
    subscriberId: number;
    amount?: number;
    debt?: number;
    penalty?: number;
    createdAt: Date;
}

export enum CalculationState {
    Started = 'Started',
    DetailsCalculated = 'DetailsCalculated',
    DebtAndPenaltiesCalculated = 'DebtAndPenaltiesCalculated',
    Calculated = 'Calculated',
    Cancelled = 'Cancelled',
}