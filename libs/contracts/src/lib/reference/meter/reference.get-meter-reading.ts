import { IsNumber, Validate } from 'class-validator';
import { IMeterReading, MeterType } from '@myhome/interfaces';
import { IsValidEnumValue } from '../../enum.validator';

export namespace ReferenceGetMeterReading {
    export const topic = 'reference.get-meter-reading.query';

    export class Request {
        @IsNumber()
        id!: number;

        @Validate(IsValidEnumValue, [MeterType])
        meterType!: MeterType;
    }

    export class Response {
        meterReading!: IMeterReading;
    }
}
