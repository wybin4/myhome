import { IsNumber, Validate } from 'class-validator';
import { IMeter, MeterType } from '@myhome/interfaces';
import { IsValidEnumValue } from '../../enum.validator';

export namespace ReferenceGetMeter {
    export const topic = 'reference.get-meter.query';

    export class Request {
        @IsNumber()
        id!: number;

        @Validate(IsValidEnumValue, [MeterType])
        meterType!: MeterType;
    }

    export class Response {
        meter!: IMeter;
    }
}
