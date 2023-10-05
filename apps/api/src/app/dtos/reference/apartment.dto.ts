import { IsNumber } from "class-validator";

export class AddApartmentDto {
    @IsNumber()
    id?: number;

    @IsNumber()
    houseId: number;

    @IsNumber()
    apartmentNumber: number;

    @IsNumber()
    totalArea: number;

    @IsNumber()
    livingArea: number;

    @IsNumber()
    numberOfRegistered: number;
}

export class GetApartmentDto {
    @IsNumber()
    id: number;
}

export class GetApartmentsByMCIdDto {
    @IsNumber()
    managementCompanyId!: number;
}
