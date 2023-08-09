import {  IDebt, IDebtDetail } from '@myhome/interfaces';

export class DebtEntity implements IDebt {
    _id?: string;
    singlePaymentDocumentId: number;
    outstandingDebt: IDebtDetail[];
    originalDebt: IDebtDetail[];
    createdAt: Date;

    constructor(debt: IDebt) {
        this._id = debt._id;
        this.singlePaymentDocumentId = debt.singlePaymentDocumentId;
        this.outstandingDebt = debt.outstandingDebt;
        this.originalDebt = debt.originalDebt;
        this.createdAt = debt.createdAt;
    }
}