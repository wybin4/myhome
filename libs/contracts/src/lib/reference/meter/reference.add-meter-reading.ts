import { IMeterReading, MeterType } from '@myhome/interfaces';
import { IsNumber, IsString, Validate } from 'class-validator';
import { IsValidEnumValue } from '../../enum.validator';

export namespace ReferenceAddMeterReading {
    export const topic = 'reference.add-meter-reading.command';

    export class Request {
        @IsNumber({}, { message: "Id счётчика должен быть числом" })
        meterId!: number;

        @Validate(IsValidEnumValue, [MeterType])
        meterType!: MeterType;

        @IsNumber({}, { message: "Показание счётчика должно быть числом" })
        reading!: number;

        @IsString({ message: "Неверная дата снятия показания" })
        readAt!: string;
    }

    export class Response {
        meterReading!: IMeterReading;
    }
}

