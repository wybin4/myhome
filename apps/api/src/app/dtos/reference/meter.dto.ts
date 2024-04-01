import { IAddMeter } from "@myhome/contracts";
import { MeterType } from "@myhome/interfaces";
import { GetMetaDto } from "../meta.dto";

export class AddMetersDto {
    meters: IAddMeter[];
    meterType: MeterType;
}

export class GetMetersByUserDto extends GetMetaDto {
    meterType: MeterType;
    isNotAllInfo?: boolean;
}

export class GetMeterReadingsByUserDto {
    meterType: MeterType;
    meterId: number;
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