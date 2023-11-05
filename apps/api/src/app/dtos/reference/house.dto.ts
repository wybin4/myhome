import { UserRole } from "@myhome/interfaces";
import { IsEnum, IsNumber, IsString } from "class-validator";

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

export class GetHousesByUserDto {
    @IsNumber()
    userId: number;

    @IsEnum(UserRole)
    userRole: UserRole;
}