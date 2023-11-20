import { TariffAndNormType, TypeOfNorm, UserRole } from "@myhome/interfaces";
import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";

export class AddTariffAndNormDto {
    @IsNumber()
    managementCompanyId: number;

    @IsNumber()
    typeOfServiceId: number;

    @IsOptional()
    @IsNumber()
    unitId?: number;

    @IsOptional()
    @IsNumber()
    norm?: number;

    @IsOptional()
    @IsNumber()
    amount?: number;

    @IsOptional()
    @IsString()
    monthName?: string;

    @IsOptional()
    @IsNumber()
    coefficient?: number;

    @IsOptional()
    @IsNumber()
    multiplier?: number;

    @IsOptional()
    @IsNumber()
    multiplyingFactor?: number;

    @IsString()
    type: TariffAndNormType;

    @IsString()
    typeOfNorm: TypeOfNorm;
}

export class GetTariffsAndNormsByUserDto {
    @IsNumber()
    userId: number;

    @IsEnum(UserRole)
    userRole: UserRole;

    @IsString()
    type: TariffAndNormType;
}

export class UpdateTariffAndNormDto {
    @IsNumber()
    id: number;

    @IsOptional()
    @IsNumber()
    norm?: number;

    @IsOptional()
    @IsNumber()
    amount?: number;

    @IsOptional()
    @IsString()
    monthName?: string;

    @IsOptional()
    @IsNumber()
    coefficient?: number;

    @IsOptional()
    @IsNumber()
    multiplier?: number;

    @IsString()
    type: TariffAndNormType;
}