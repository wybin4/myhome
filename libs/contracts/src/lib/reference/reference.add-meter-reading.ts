import { IGeneralMeterReading, IIndividualMeterReading, MeterType } from '@myhome/interfaces';
import { IsNumber, IsString } from 'class-validator';

export namespace ReferenceAddMeterReading {
    export const topic = 'reference.add-meter-reading.command';

    export class Request {
        @IsNumber()
        meterId!: number;

        @IsString()
        meterType!: MeterType;

        @IsNumber()
        reading!: number;

        @IsString()
        readAt!: string;
    }

    export class Response {
        meterReading!: IIndividualMeterReading | IGeneralMeterReading;
    }
}

