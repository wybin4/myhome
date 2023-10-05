import { IsNumber, IsString } from 'class-validator';
import {  IMeterReading, MeterType } from '@myhome/interfaces';

export namespace ReferenceGetMeterReading {
    export const topic = 'reference.get-meter-reading.query';

    export class Request {
        @IsNumber()
        id!: number;

        @IsString()
        meterType!: MeterType;
    }

    export class Response {
        meterReading!: IMeterReading;
    }
}
