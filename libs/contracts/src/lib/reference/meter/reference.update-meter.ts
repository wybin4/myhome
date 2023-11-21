import { IsNumber, IsString, Validate } from 'class-validator';
import { IGeneralMeter, IIndividualMeter, MeterType } from '@myhome/interfaces';
import { IsValidEnumValue } from '../../enum.validator';

export namespace ReferenceUpdateMeter {
    export const topic = 'reference.update-meter.command';

    export class Request {
        @IsNumber({}, { message: "Id счётчика должно быть числом" })
        id!: number;

        @IsString({ message: "Неверная дата поверки" })
        verifiedAt!: string;

        @Validate(IsValidEnumValue, [MeterType])
        meterType!: MeterType;
    }

    export class Response {
        meter!: IGeneralMeter | IIndividualMeter;
    }
}
