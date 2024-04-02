import { AppealStatus } from "@myhome/interfaces";

export class AddAppealDto {
    managementCompanyId: string;
    typeOfAppeal: string;
    subscriberId: string;
    typeOfServiceId?: string;
    apartmentId?: string;
    factoryNumber?: string;
    issuedAt?: string;
    verifiedAt?: string;
    meterId?: string;
    text?: string;
}

export class UpdateAppealDto {
    id!: number;
    status!: AppealStatus;
}