import { IGeneralMeter, IIndividualMeter, MeterType, RequireHomeOrApartment } from '@myhome/interfaces';
import {  IsNumber, IsString } from 'class-validator';

export namespace ReferenceAddMeter {
    export const topic = 'reference.add-meter.command';

    export class Request {
        @IsNumber()
        typeOfServiceId!: number;

        @RequireHomeOrApartment()
        apartmentId?: number;

        @RequireHomeOrApartment()
        houseId?: number;

        @IsString()
        factoryNumber!: string;

        @IsString()
        verifiedAt!: string;

        @IsString()
        issuedAt!: string;

        @IsString()
        meterType!: MeterType;
    }

    export class Response {
        meter!: IIndividualMeter | IGeneralMeter;
    }
}

