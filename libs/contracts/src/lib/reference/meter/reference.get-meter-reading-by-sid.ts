import { IsArray, IsNumber } from 'class-validator';
import { IGetMeterReadings } from '@myhome/interfaces';

export namespace ReferenceGetMeterReadingBySID {
    export const topic = 'reference.get-meter-reading-by-sid.query';

    export class Request {
        @IsArray()
        subscriberIds!: number[];

        @IsNumber()
        managementCompanyId!: number;
    }

    export class Response {
        meterReadings!: IGetMeterReadings[];
    }
}
