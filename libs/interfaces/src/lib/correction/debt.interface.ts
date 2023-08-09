export interface IDebt {
    _id?: string;
    singlePaymentDocumentId: number;
    outstandingDebt: IDebtDetail[];
    originalDebt: IDebtDetail[];
    createdAt: Date;
}

export interface IDebtDetail {
    penaltyRuleId: string;
    amount: number;
}