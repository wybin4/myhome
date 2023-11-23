import { Types } from 'mongoose';

export interface IDebt {
    _id?: Types.ObjectId;
    singlePaymentDocumentId: number;
    debtHistory: IDebtHistory[];
    originalDebt: IDebtDetail[];
    createdAt: Date;
}

export interface IDebtDetail {
    _id?: string;
    penaltyRuleId: string;
    amount: number;
}

export interface IDebtHistory {
    _id?: string;
    outstandingDebt: IDebtDetail[];
    date: Date;
    originalPenalty?: number; // Во всех, кроме последней записи
    outstandingPenalty?: number; // Во всех, кроме последней записи
}