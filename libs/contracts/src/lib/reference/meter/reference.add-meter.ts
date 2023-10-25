import { IMeter, MeterType, RequireHomeOrApartment } from '@myhome/interfaces';
import { IsNumber, IsString, Validate } from 'class-validator';
import { IsValidEnumValue } from '../../enum.validator';

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

        @Validate(IsValidEnumValue, [MeterType])
        meterType!: MeterType;
    }

    export class Response {
        meter!: IMeter;
    }
}

