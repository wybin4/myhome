import { IsNumber, IsString } from "class-validator";

export class AddHouseDto {
    @IsNumber()
    managementCompanyId: number;

    @IsString()
    city: string;

    @IsString()
    street: string;

    @IsString()
    houseNumber: string;

    @IsNumber()
    livingArea!: number;

    @IsNumber()
    noLivingArea!: number;

    @IsNumber()
    commonArea!: number;
}

export class GetHouseDto {
    @IsNumber()
    id: number;
}

export class UpdateHouseDto {
    @IsNumber()
    id: number;

    @IsNumber()
    managementCompanyId: number;
}