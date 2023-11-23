import { IDebt, IDebtDetail, IDebtHistory } from '@myhome/interfaces';
import { Types } from 'mongoose';

export class DebtEntity implements IDebt {
    _id?: Types.ObjectId;
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

    public async get() {
        return {
            singlePaymentDocumentId: this.singlePaymentDocumentId,
            debtHistory: this.debtHistory,
            originalDebt: this.originalDebt,
            createdAt: this.createdAt,
        }
    }
}