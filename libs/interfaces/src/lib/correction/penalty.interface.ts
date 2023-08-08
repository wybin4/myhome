export interface IPenalty {
    id?: number;
    singlePaymentDocumentId: number;
    originalPenalty: number;
    outstandingPenalty: number;
    createdAt: Date;
}

export interface IPenaltyRule {
    id?: number;
    description: string;
}
