import { IsNumber, IsString } from 'class-validator';
import { IMeter, MeterType } from '@myhome/interfaces';

export namespace ReferenceGetMetersByMCId {
    export const topic = 'reference.get-meters-by-mcid.query';

    export class Request {
        @IsNumber()
        managementCompanyId!: number;

        @IsString()
        meterType!: MeterType;
    }

    export class Response {
        meters!: IGetMetersByMCId[];
    }
}

export interface IGetMetersByMCId extends IMeter {
    typeOfServiceName: string;
    houseName: string;
    currentReading: number;
    currentReadAt: Date;
    previousReading: number;
    previousReadAt: Date;
}