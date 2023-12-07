import { IAddMeter } from "@myhome/contracts";
import { IMeta, MeterType } from "@myhome/interfaces";

export class AddMetersDto {
    meters: IAddMeter[];
    meterType: MeterType;
}

export class GetMetersByUserDto {
    meterType!: MeterType;
    isNotAllInfo?: boolean;
    meta?: IMeta;
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