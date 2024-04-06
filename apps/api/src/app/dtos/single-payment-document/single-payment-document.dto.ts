export class GetSinglePaymentDocumentDto {
    subscriberIds?: number[];
    houseIds?: number[];
    managementCompanyId!: number;
    keyRate?: number;
}

export class GetSinglePaymentDocumentsByUserDto { }

export class CheckSinglePaymentDocumentsDto { id: number; }
