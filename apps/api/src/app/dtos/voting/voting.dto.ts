import { IOption, RequireSubscriberOrManagementCompany } from "@myhome/interfaces";
import { IsArray, IsDate, IsNumber, IsString, MaxLength } from "class-validator";

export class AddVotingDto {
    @IsNumber()
    managementCompanyId!: number;

    @IsString()
    @MaxLength(255)
    title!: string;

    @IsDate()
    createdAt!: Date;

    @IsDate()
    expiredAt!: Date;

    @IsArray()
    options!: Omit<IOption, 'votingId'>[];
}

export class GetVotingDto {
    @IsNumber()
    id!: number;
}

export class GetVotingsDto {
    @RequireSubscriberOrManagementCompany()
    subscriberId?: number;

    @RequireSubscriberOrManagementCompany()
    managementCompanyId?: number;
}


export class UpdateVotingDto {
    @IsNumber()
    optionId!: number;
}
