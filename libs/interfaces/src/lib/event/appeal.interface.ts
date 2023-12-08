export interface IAppeal {
    id?: number;
    managementCompanyId: number;
    typeOfAppeal: AppealType;
    subscriberId: number;
    createdAt: Date;
    status: AppealStatus;
}

export interface IAppealData extends IAppeal {
    data: AppealData;
}

export interface IAppealEntity extends IAppeal {
    data: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface AppealData { }

export interface AddIndividualMeterData extends AppealData {
    typeOfServiceId: number;
    apartmentId: number;
    factoryNumber: string;
    issuedAt: Date;
    verifiedAt: Date;
    attachment: string;
}

export interface VerifyIndividualMeterData extends AppealData {
    meterId: number;
    verifiedAt: Date;
    issuedAt: Date;
    attachment: string;
}

export interface ProblemOrQuestionData extends AppealData {
    text: string;
}

export interface ClaimData extends AppealData {
    text: string;
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