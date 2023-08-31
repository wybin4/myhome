import { IsArray, IsNumber } from 'class-validator';
import { IGetMeterReadings, ISubscriber } from '@myhome/interfaces';

export namespace ReferenceGetMeterReadingBySID {
    export const topic = 'reference.get-meter-reading-by-sid.query';

    export class Request {
        @IsArray()
        subscribers!: ISubscriber[];

        @IsNumber()
        managementCompanyId!: number;
    }

    export class Response {
        meterReadings!: IGetMeterReadings[];
    }
}
