import { IsBoolean, IsNumber, IsOptional, Validate } from 'class-validator';
import { IMeter, MeterType, UserRole } from '@myhome/interfaces';
import { IsValidEnumValue } from '../../enum.validator';
import { MetaRequest } from '../../meta.validator';

export namespace ReferenceGetMetersByUser {
    export const topic = 'reference.get-meters-by-user.query';

    export class Request extends MetaRequest {
        @IsNumber({}, { message: "Id пользователя должен быть числом" })
        userId!: number;

        @Validate(IsValidEnumValue, [UserRole])
        userRole!: UserRole;

        @Validate(IsValidEnumValue, [MeterType])
        meterType!: MeterType;

        @IsOptional()
        @IsBoolean({ message: "Флаг должен быть правдой или ложью" })
        isNotAllInfo?: boolean;
    }

    export class Response {
        meters!: IGetMetersByMCId[] | IGetMeterByAIDs[] | IGetMeters[];
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
    typeOfServiceEngName: string;
    unitName: string;
    factoryNumber: string;
    verifiedAt: Date;
    issuedAt: Date;
    currentReading: number;
}

export interface IGetMeters extends IMeter {
    typeOfServiceName: string;
    typeOfServiceEngName: string;
    address: string;
    subscriberId?: number;
}