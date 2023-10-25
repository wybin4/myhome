import { IMeterReading, MeterType } from '@myhome/interfaces';
import { IsNumber, IsString, Validate } from 'class-validator';
import { IsValidEnumValue } from '../../enum.validator';

export namespace ReferenceAddMeterReading {
    export const topic = 'reference.add-meter-reading.command';

    export class Request {
        @IsNumber()
        meterId!: number;

        @Validate(IsValidEnumValue, [MeterType])
        meterType!: MeterType;

        @IsNumber()
        reading!: number;

        @IsString()
        readAt!: string;
    }

    export class Response {
        meterReading!: IMeterReading;
    }
}

