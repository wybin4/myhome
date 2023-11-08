import { AppealStatus, AppealType, IAppealEntity } from "@myhome/interfaces";
import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";

export class AddAppealDto {
    @IsNumber()
    id?: number;

    @IsNumber()
    managementCompanyId: number;

    @IsEnum(AppealType)
    typeOfAppeal: AppealType;

    @IsNumber()
    subscriberId: number;

    @IsOptional()
    @IsString()
    status?: AppealStatus;

    data: IAppealEntity;
}