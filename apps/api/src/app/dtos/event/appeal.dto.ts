import { AppealData, AppealStatus, AppealType } from "@myhome/interfaces";

export class AddAppealDto {
    managementCompanyId: number;
    typeOfAppeal: AppealType;
    subscriberId: number;
    status?: AppealStatus;
    data: AppealData;
}

export class UpdateAppealDto {
    id!: number;
    status!: AppealStatus;
}