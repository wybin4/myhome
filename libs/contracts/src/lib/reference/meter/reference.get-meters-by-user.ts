import { IsNumber, Validate } from 'class-validator';
import { IMeter, MeterType, UserRole } from '@myhome/interfaces';
import { IsValidEnumValue } from '../../enum.validator';

export namespace ReferenceGetMetersByUser {
    export const topic = 'reference.get-meters-by-user.query';

    export class Request {
        @IsNumber({}, { message: "Id пользователя должен быть числом" })
        userId!: number;

        @Validate(IsValidEnumValue, [UserRole])
        userRole!: UserRole;

        @Validate(IsValidEnumValue, [MeterType])
        meterType!: MeterType;
    }

    export class Response {
        meters!: IGetMetersByMCId[] | IGetMeterByAIDs[];
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

export interface IGetMeterByAIDs {
    apartmentId: number;
    apartmentFullAddress: string;
    apartmentNumber: number;

    meters: IGetMeterByAID[];
}

export interface IGetMeterByAID {
    id: number;
    typeOfServiceId: number;
    typeOfServiceName: string;
    unitName: string;
    readings: {
        current: number;
        previous: number;
        previousReadAt: Date;
    }
    factoryNumber: string;
    verifiedAt: Date;
    issuedAt: Date;
}