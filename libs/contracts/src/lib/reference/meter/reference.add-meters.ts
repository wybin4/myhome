/* eslint-disable @typescript-eslint/no-explicit-any */
import { MeterType, RequireHomeOrApartment } from '@myhome/interfaces';
import { ArrayMinSize, IsDefined, Validate, ValidationOptions, registerDecorator } from 'class-validator';
import { IsValidEnumValue } from '../../enum.validator';
import { IGetMetersByMCId } from './reference.get-meters-by-user';
import { ValidateNestedArray } from '../../array.validator';
import { ParseDate, ParseInt } from '../../parse.validator';

export function ParseFactoryNumber(validationOptions?: ValidationOptions) {
    return function (object: any, propertyName: string) {
        registerDecorator({
            name: 'ParseFactoryNumber',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any) {
                    return typeof value === "string" || typeof value === "number";
                },

                defaultMessage() {
                    return `Значение должно быть датой`;
                }
            },
        });
    };
}

export namespace ReferenceAddMeters {
    export const topic = 'reference.add-meters.command';

    class MeterValidator {
        @ParseInt({ message: "Id вида услуг должен быть числом" })
        typeOfServiceId!: number;

        @RequireHomeOrApartment()
        apartmentId?: number;

        @RequireHomeOrApartment()
        houseId?: number;

        @ParseFactoryNumber({ message: "Неверный заводской номер счётчика" })
        factoryNumber!: string | number;

        @ParseDate({ message: "Неверная дата поверки" })
        verifiedAt!: string;

        @ParseDate({ message: "Неверная дата истечения поверки" })
        issuedAt!: string;

        @ParseInt({ message: "Показание счётчика должно быть числом" })
        previousReading!: number;

        @ParseDate({ message: "Неверная дата снятия показания" })
        previousReadAt!: string;
    }

    export class Request {
        @IsDefined({ message: "Массив счётчиков должен существовать" })
        @ArrayMinSize(1, { message: "Массив счётчиков не должен быть пустым" })
        @ValidateNestedArray(MeterValidator)
        meters!: IAddMeter[];

        @Validate(IsValidEnumValue, [MeterType])
        meterType!: MeterType;
    }

    export class Response {
        meters!: IGetMetersByMCId[];
    }
}

export interface IAddMeter {
    typeOfServiceId: number;
    apartmentId?: number;
    houseId?: number;
    factoryNumber: string | number;
    verifiedAt: string;
    issuedAt: string;
    previousReading: number;
    previousReadAt: string;
}
