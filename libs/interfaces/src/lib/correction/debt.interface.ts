export interface IDebt {
    id?: number;
    singlePaymentDocumentId: number;
    outstandingDebt: string; // на самом деле IDebtDetail[]
    originalDebt: string; // на самом деле IDebtDetail[]
    createdAt: Date;
}

export interface IDebtDetail {
    typeOfPenaltyRuleId: number;
    amount: number;
}