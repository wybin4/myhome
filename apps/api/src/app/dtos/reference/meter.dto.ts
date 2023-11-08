import { MeterType, RequireHomeOrApartment, UserRole } from "@myhome/interfaces";
import { IsNumber, IsString, IsEnum, IsBoolean, IsOptional } from "class-validator";

export class AddMeterDto {
    @IsNumber()
    typeOfServiceId: number;

    @RequireHomeOrApartment()
    apartmentId?: number;

    @RequireHomeOrApartment()
    houseId?: number;

    @IsString()
    factoryNumber: string;

    @IsString()
    verifiedAt: string;

    @IsString()
    issuedAt: string;

    @IsString()
    meterType: MeterType;
}

export class GetMetersByUserDto {
    @IsNumber()
    userId: number;

    @IsEnum(UserRole)
    userRole: UserRole;

    @IsEnum(MeterType)
    meterType!: MeterType;

    @IsOptional()
    @IsBoolean()
    isNotAllInfo?: boolean;
}

export class UpdateMeterDto {
    @IsNumber()
    id: number;

    @IsString()
    verifiedAt: string;

    @IsString()
    meterType: MeterType;
}

export class AddMeterReadingDto {
    @IsNumber()
    meterId!: number;

    @IsString()
    meterType!: MeterType;

    @IsNumber()
    reading!: number;

    @IsString()
    readAt!: string;
}