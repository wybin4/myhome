export interface IPayment {
    id: number;
    amount: number;
    singlePaymentDocumentId: number;
    payedAt: Date;
}