import { IsNumber, Validate } from 'class-validator';
import { IGeneralMeter, IIndividualMeter, MeterType } from '@myhome/interfaces';
import { IsValidEnumValue } from '../../enum.validator';
import { ParseDate } from '../../parse.validator';

export namespace ReferenceUpdateMeter {
    export const topic = 'reference.update-meter.command';

    export class Request {
        @IsNumber({}, { message: "Id счётчика должно быть числом" })
        id!: number;

        @ParseDate({ message: "Неверная дата поверки" })
        verifiedAt!: string;

        @ParseDate({ message: "Неверная дата истечения поверки" })
        issuedAt!: string;

        @Validate(IsValidEnumValue, [MeterType])
        meterType!: MeterType;
    }

    export class Response {
        meter!: IGeneralMeter | IIndividualMeter;
    }
}
