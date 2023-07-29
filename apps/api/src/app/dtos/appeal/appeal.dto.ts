import { AppealStatus } from "@myhome/interfaces";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class AddAppealDto {
    @IsNumber()
    id?: number;

    @IsNumber()
    managementCompanyId: number;

    @IsNumber()
    typeOfAppealId: number;

    @IsNumber()
    subscriberId: number;

    @IsString()
    createdAt: string;

    @IsOptional()
    @IsString()
    status?: AppealStatus;

    data: unknown;
}

export class GetAppealDto {
    @IsNumber()
    id: number;
}
