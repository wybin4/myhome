import { MeterType } from "@myhome/interfaces";

export class AddMeterDto {
    typeOfServiceId: number;
    apartmentId?: number;
    houseId?: number;
    factoryNumber: string;
    verifiedAt: string;
    issuedAt: string;
    meterType: MeterType;
}

export class GetMetersByUserDto {
    meterType!: MeterType;
    isNotAllInfo?: boolean;
}

export class UpdateMeterDto {
    id: number;
    verifiedAt: string;
    meterType: MeterType;
}

export class AddMeterReadingDto {
    meterId!: number;
    meterType!: MeterType;
    reading!: number;
    readAt!: string;
}