export interface IAppeal {
    id?: number;
    managementCompanyId: number;
    typeOfAppealId: number;
    subscriberId: number;
    createdAt: Date;
    status: AppealStatus;
    data: unknown;
}

export interface ITypeOfAppeal {
    id?: number;
    name: string;
}

export enum AppealStatus {
    Processing = 'Processing',
    Closed = 'Closed',
    Rejected = 'Rejected'
}

export enum AppealType {
    AddIndividualMeter = 'Замена счётчика',
    VerifyIndividualMeter = 'Поверка счётчика',
    Claim = 'Претензия',
    ProblemOrQuestion = 'Проблема или вопрос'
}