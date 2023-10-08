/* eslint-disable @typescript-eslint/no-explicit-any */
import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';


export interface IMeter {
    id?: number;
    typeOfServiceId: number;
    factoryNumber: string;
    verifiedAt: Date;
    issuedAt: Date;
    status: MeterStatus;
}

export interface IMeterReading {
    id?: number;
    reading: number;
    readAt: Date;
}

export interface IIndividualMeter extends IMeter {
    apartmentId: number;
}

export interface IGeneralMeter extends IMeter {
    houseId: number;
}

export interface IIndividualMeterReading extends IMeterReading {
    individualMeterId: number;
}

export interface IGeneralMeterReading extends IMeterReading {
    generalMeterId: number;
}

export enum MeterType {
    General = 'General',
    Individual = 'Individual',
}

export enum MeterStatus {
    Active = 'Active',
    Archieve = 'Archieve',
    NoPossibility = 'NoPossibility',
    NotInstall = 'NotInstall',
}

export type FullReading = { current: number; previous: number; difference: number; };
export type NormReading = { norm: number; };
export type AvgReading = { avgVolume: number; };
export type Reading = FullReading | NormReading | AvgReading;

export interface IGetMeterReadings {
    data: IGetMeterReading[];
    subscriberId: number;
}

export interface IGetMeterReading {
    meterReadings: IIndividualMeterReading | IGeneralMeterReading;
    typeOfServiceId: number;
    fullMeterReadings: Reading;
}

export function RequireHomeOrApartment(validationOptions?: ValidationOptions) {
    return function (object: any, propertyName: string) {
        registerDecorator({
            name: 'RequireHomeOrApartment',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    const houseId = (args.object as any).houseId;
                    const apartmentId = (args.object as any).apartmentId;
                    return !!houseId || !!apartmentId;
                },
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                defaultMessage(args: ValidationArguments) {
                    return `В зависимости от типа счётчика введите houseId или apartmentId`;
                },
            },
        });
    };
}
