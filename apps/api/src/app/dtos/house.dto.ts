import { IsNumber, IsString } from "class-validator";

export class AddHouseDto {
    @IsNumber()
    id?: number;

    @IsNumber()
    managementCompanyId: number;

    @IsString()
    city: string;

    @IsString()
    street: string;

    @IsString()
    houseNumber: string;
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