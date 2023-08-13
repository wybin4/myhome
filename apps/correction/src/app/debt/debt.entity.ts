import { IDebt, IDebtDetail, IDebtHistory } from '@myhome/interfaces';

export class DebtEntity implements IDebt {
    _id?: string;
    singlePaymentDocumentId: number;
    debtHistory: IDebtHistory[];
    originalDebt: IDebtDetail[];
    createdAt: Date;

    constructor(debt: IDebt) {
        this._id = debt._id;
        this.singlePaymentDocumentId = debt.singlePaymentDocumentId;
        this.debtHistory = debt.debtHistory;
        this.originalDebt = debt.originalDebt;
        this.createdAt = debt.createdAt;
    }
}