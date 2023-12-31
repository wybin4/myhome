import { IsArray, Validate } from 'class-validator';
import { IMeterWithTypeOfService, MeterType } from '@myhome/interfaces';
import { IsValidEnumValue } from '../../enum.validator';

export namespace ReferenceGetMeters {
    export const topic = 'reference.get-meters.query';

    export class Request {
        @IsArray({message: "Id счётчиков должны быть массивом чисел"})
        ids!: number[];

        @Validate(IsValidEnumValue, [MeterType])
        meterType!: MeterType;
    }

    export class Response {
        meters!: IMeterWithTypeOfService[];
    }
}