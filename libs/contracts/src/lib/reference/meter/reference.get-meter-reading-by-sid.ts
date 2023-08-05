import { IsNumber, IsString } from 'class-validator';
import {  IGetMeterReading, ISubscriber, MeterType } from '@myhome/interfaces';

export namespace ReferenceGetMeterReadingBySID {
    export const topic = 'reference.get-meter-reading-by-sid.query';

    export class Request {
        subscriber!: ISubscriber;

        @IsString()
        meterType!: MeterType;

        @IsNumber()
        managementCompanyId!: number;
    }

    export class Response {
        meterReadings!: IGetMeterReading[];
    }
}
