export interface IDebt {
    id?: number;
    singlePaymentDocumentId: number;
    outstandingDebt: IDebtDetail[];
    originalDebt: IDebtDetail[];
    createdAt: Date;
}

export interface IDebtDetail {
    typeOfPenaltyRuleId: number;
    amount: number;
}