import { IsString } from 'class-validator';
import { IGeneralMeterReading, IIndividualMeterReading, ISubscriber, MeterType } from '@myhome/interfaces';

export namespace ReferenceGetMeterReadingBySID {
    export const topic = 'reference.get-meter-reading-by-sid.query';

    export class Request {
        subscriber!: ISubscriber;

        @IsString()
        meterType!: MeterType;
    }

    export class Response {
        meterReadings!: IGetMeterReadingBySID[];
    }
}

export interface IGetMeterReadingBySID {
    meterReadings: IIndividualMeterReading[] | IGeneralMeterReading[];
    typeOfSeriveId: number;
}