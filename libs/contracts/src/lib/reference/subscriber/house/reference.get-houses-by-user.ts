import { IsNumber, Validate } from 'class-validator';
import { IHouse, UserRole } from '@myhome/interfaces';
import { IsValidEnumValue } from '../../../enum.validator';

export namespace ReferenceGetHousesByUser {
    export const topic = 'reference.get-houses-by-user.query';

    export class Request {
        @IsNumber({}, { message: "Id пользователя должен быть числом" })
        userId!: number;

        @Validate(IsValidEnumValue, [UserRole])
        userRole!: UserRole;
    }

    export class Response {
        houses!: IHouse[];
    }
}
