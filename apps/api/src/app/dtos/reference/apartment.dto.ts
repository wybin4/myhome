import { UserRole } from "@myhome/interfaces";
import { IsBoolean, IsEnum, IsNumber } from "class-validator";

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

export class GetApartmentsByUserDto {
    @IsNumber()
    userId: number;

    @IsEnum(UserRole)
    userRole: UserRole;

    @IsBoolean()
    isAllInfo!: boolean;
}
