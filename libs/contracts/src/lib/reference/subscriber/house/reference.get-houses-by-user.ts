import { IsBoolean, IsNumber, Validate } from 'class-validator';
import { IHouse, UserRole } from '@myhome/interfaces';
import { IsValidEnumValue } from '../../../enum.validator';

export namespace ReferenceGetHousesByUser {
    export const topic = 'reference.get-houses-by-user.query';

    export class Request {
        @IsNumber({}, { message: "Id пользователя должен быть числом" })
        userId!: number;

        @Validate(IsValidEnumValue, [UserRole])
        userRole!: UserRole;

        @IsBoolean({ message: "Флаг должен быть правдой или ложью" })
        isAllInfo!: boolean;
    }

    export class Response {
        houses!: IHouse[] | IGetHouse[];
    }
}

export interface IGetHouse extends IHouse {
    name: string;
}