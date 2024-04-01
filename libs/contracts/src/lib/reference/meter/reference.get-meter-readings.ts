import { IsNumber, Validate } from 'class-validator';
import { IMeterReading, MeterType } from '@myhome/interfaces';
import { IsValidEnumValue } from '../../enum.validator';
import { MetaRequest } from '../../meta.validator';

export namespace ReferenceGetMeterReadingsByUser {
    export const topic = 'reference.get-meter-readings.query';

    export class Request extends MetaRequest {
        @IsNumber({}, { message: "Id счетчика должен быть числом" })
        meterId!: number;

        @Validate(IsValidEnumValue, [MeterType])
        meterType!: MeterType;
    }

    export class Response {
        readings!: IMeterReading[];
    }
}

export interface IGetMeterReading extends IMeterReading {
    consumption: number;
}