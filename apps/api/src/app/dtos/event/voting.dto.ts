import { IsArray, IsDate, IsNumber, IsString } from "class-validator";

export class AddVotingDto {
    @IsNumber()
    houseId!: number;

    @IsString()
    title!: string;

    @IsDate()
    createdAt!: string;

    @IsDate()
    expiredAt!: string;

    @IsArray()
    options!: string[];
}

export class UpdateVotingDto {
    @IsNumber()
    optionId!: number;

    @IsNumber()
    userId!: number;
}
