export interface IAppeal {
    id?: number;
    managementCompanyId: number;
    typeOfAppeal: AppealType;
    subscriberId: number;
    createdAt: Date;
    status: AppealStatus;
    data: unknown;
}

export enum AppealStatus {
    Processing = 'Processing',
    Closed = 'Closed',
    Rejected = 'Rejected'
}

export enum AppealType {
    AddIndividualMeter = 'AddIndividualMeter',
    VerifyIndividualMeter = 'VerifyIndividualMeter',
    Claim = 'Claim',
    ProblemOrQuestion = 'ProblemOrQuestion'
}