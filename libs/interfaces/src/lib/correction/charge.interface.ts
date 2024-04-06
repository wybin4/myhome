import { IDebtDetail } from "./debt.interface";

export interface IDebtSpdRelationItem {
    spdId: number;
    percent: number;
    createdAt: Date;
    amountChange: AmountChange;
    originalDebt: number;
    outstandingDebt: number;
}

export interface IDebtSpdRelationGroup {
    apartmentId: number;
    spdDebtRelationList: IDebtSpdRelationItem[];
}

export interface IGetCharge {
    id: number;
    originalDebt: number;
    outstandingDebt: number;
    apartmentName: string;
    apartmentId: number;
    mcName: string;
    mcCheckingAccount: string;
    createdAt: Date;
    percent: number;
    amountChange: AmountChange
}

export interface IGetChargeChart {
    id: number;
    amount: number;
    createdAt: Date;
    apartmentId: number;
    apartmentName: string;
}

export enum AmountChange {
    Positive = "Positive", Negative = "Negative", None = "None"
}

export interface IDebtForCharge {
    singlePaymentDocumentId: number;
    outstandingDebt: IDebtDetail[];
    originalDebt: IDebtDetail[];
}

export interface IDebtForCharge {
    singlePaymentDocumentId: number;
    outstandingDebt: IDebtDetail[];
    originalDebt: IDebtDetail[];
}