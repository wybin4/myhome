export interface IDeposit {
    id?: number;
    singlePaymentDocumentId: number;
    originalDeposit: number;
    outstandingDeposit: number;
    createdAt: Date;
}
