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
}

export class GetApartmentDto {
    @IsNumber()
    id: number;
}
