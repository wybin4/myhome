import { IsDate, IsNumber, IsString } from 'class-validator';
import { IGeneralMeter, IIndividualMeter, MeterType } from '@myhome/interfaces';

export namespace ReferenceUpdateMeter {
    export const topic = 'reference.update-meter.command';

    export class Request {
        @IsNumber()
        id!: number;

        @IsDate()
        verifiedAt!: Date;

        @IsString()
        meterType!: MeterType;
    }

    export class Response {
        meter!: IGeneralMeter | IIndividualMeter;
    }
}
