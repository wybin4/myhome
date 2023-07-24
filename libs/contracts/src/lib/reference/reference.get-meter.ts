import { IsNumber, IsString } from 'class-validator';
import { IGeneralMeter, IIndividualMeter, MeterType } from '@myhome/interfaces';

export namespace ReferenceGetMeter {
    export const topic = 'reference.get-meter.query';

    export class Request {
        @IsNumber()
        id!: number;

        @IsString()
        meterType!: MeterType;
    }

    export class Response {
        meter!: IIndividualMeter | IGeneralMeter;
    }
}
