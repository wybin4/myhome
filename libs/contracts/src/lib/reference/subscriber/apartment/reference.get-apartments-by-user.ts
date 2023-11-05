import { IApartment, UserRole } from '@myhome/interfaces';
import { IsBoolean, IsNumber, Validate } from 'class-validator';
import { IsValidEnumValue } from '../../../enum.validator';

export namespace ReferenceGetApartmentsByUser {
    export const topic = 'reference.get-apartments-by-user.query';

    export class Request {
        @IsNumber({}, { message: "Id пользователя должен быть числом" })
        userId!: number;

        @Validate(IsValidEnumValue, [UserRole])
        userRole!: UserRole;

        @IsBoolean({ message: "Флаг должен быть правдой или ложью" })
        isAllInfo!: boolean;
    }

    export class Response {
        apartments!: IGetApartment[] | IGetApartmentWithInfo[];
    }
}

export interface IGetApartment extends IApartment {
    name: string;
}

export interface IGetApartmentWithInfo extends IApartment {
    address: string;
}