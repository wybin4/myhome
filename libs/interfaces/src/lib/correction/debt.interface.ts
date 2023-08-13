export interface IDebt {
    _id?: string;
    singlePaymentDocumentId: number;
    debtHistory: IDebtHistory[];
    originalDebt: IDebtDetail[];
    createdAt: Date;
}

export interface IDebtDetail {
    penaltyRuleId: string;
    amount: number;
}

export interface IDebtHistory {
    outstandingDebt: IDebtDetail[];
    date: Date;
}