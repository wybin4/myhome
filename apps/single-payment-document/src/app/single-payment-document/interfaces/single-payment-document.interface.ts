export interface ISpd {
    month: string; amount: number; penalty: number; deposit: number; debt: number; subscriberId: number;
}
export interface ISpdPayment {
    amount: number; payedAt: Date;
}
export interface ISpdDocumentDetail {
    typeOfServiceName: string; unitName: string; volume: ISpdService; tariff: number;
    amount: ISpdService; totalAmount: number;
}
export interface ISpdService {
    commonHouseNeed: number; publicUtility: number;
}
export interface ISpdDetailInfo { subscriberId: number; details: ISpdDocumentDetail[]; total: number; };