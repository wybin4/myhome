import { MeterType, RequireHomeOrApartment } from '@myhome/interfaces';
import { IsNumber, IsString, Validate } from 'class-validator';
import { IsValidEnumValue } from '../../enum.validator';
import { IGetMetersByMCId } from './reference.get-meters-by-user';

export namespace ReferenceAddMeter {
    export const topic = 'reference.add-meter.command';

    export class Request {
        @IsNumber({}, { message: "Id вида услуг должен быть числом" })
        typeOfServiceId!: number;

        @RequireHomeOrApartment()
        apartmentId?: number;

        @RequireHomeOrApartment()
        houseId?: number;

        @IsString({ message: "Заводской номер счётчика должен быть строкой" })
        factoryNumber!: string;

        @IsString({ message: "Неверная дата поверки" })
        verifiedAt!: string;

        @IsString({ message: "Неверная дата истечения поверки" })
        issuedAt!: string;

        @Validate(IsValidEnumValue, [MeterType])
        meterType!: MeterType;

        @IsNumber({}, { message: "Показание счётчика должно быть числом" })
        previousReading!: number;

        @IsString({ message: "Неверная дата снятия показания" })
        previousReadAt!: string;
    }

    export class Response {
        meter!: IGetMetersByMCId;
    }
}

