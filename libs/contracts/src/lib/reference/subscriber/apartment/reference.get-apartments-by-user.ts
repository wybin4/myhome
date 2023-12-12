import { IApartment, UserRole } from '@myhome/interfaces';
import { IsBoolean, IsNumber, IsOptional, Validate } from 'class-validator';
import { IsValidEnumValue } from '../../../enum.validator';
import { MetaRequest, MetaResponse } from '../../../meta.validator';

export namespace ReferenceGetApartmentsByUser {
    export const topic = 'reference.get-apartments-by-user.query';

    export class Request extends MetaRequest {
        @IsNumber({}, { message: "Id пользователя должен быть числом" })
        userId!: number;

        @Validate(IsValidEnumValue, [UserRole])
        userRole!: UserRole;

        @IsOptional()
        @IsBoolean({ message: "Флаг должен быть правдой или ложью" })
        isAllInfo!: boolean;
    }

    export class Response extends MetaResponse {
        apartments!: IGetApartment[] | IGetApartmentWithInfo[];
    }
}

export interface IGetApartment extends IApartment {
    name: string;
}

export interface IGetApartmentWithInfo extends IApartment {
    address: string;
    subscriberId: number;
}