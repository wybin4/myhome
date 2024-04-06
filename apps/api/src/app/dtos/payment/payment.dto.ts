export class GetPaymentsByUserDto { }
export class GetPaymentsBySpdIdDto { singlePaymentDocumentId: number; }

export class AcceptPaymentDto {
    label: string;
    amount: string;
    unaccepted: string;
}