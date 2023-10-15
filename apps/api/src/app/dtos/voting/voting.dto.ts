import { IOption } from "@myhome/interfaces";
import { IsArray, IsDate, IsNumber, IsString, MaxLength } from "class-validator";

export class AddVotingDto {
    @IsNumber()
    houseId!: number;

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

export class GetVotingsByMCIdDto {
    @IsNumber()
    managementCompanyId: number;
}


export class UpdateVotingDto {
    @IsNumber()
    optionId!: number;
}
