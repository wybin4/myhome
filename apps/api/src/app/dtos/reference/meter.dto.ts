import { MeterType, RequireHomeOrApartment } from "@myhome/interfaces";
import { IsNumber, IsString, IsArray } from "class-validator";

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

export class GetMetersByMCIdDto {
    @IsNumber()
    managementCompanyId: number;

    @IsString()
    meterType: MeterType;
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

export class GetMeterReadingDto {
    @IsNumber()
    id!: number;

    @IsString()
    meterType!: MeterType;
}

export class GetMetersAllInfoBySID {
    @IsArray()
    subscriberIds!: number[];
}
