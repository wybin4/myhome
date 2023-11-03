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

    @IsString()
    createdAt: string;

    @IsOptional()
    @IsString()
    status?: AppealStatus;

    data: IAppealEntity;
}