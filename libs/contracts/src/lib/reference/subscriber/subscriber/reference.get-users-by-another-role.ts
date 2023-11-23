import { UserRole } from '@myhome/interfaces';
import { IsNumber, Validate } from 'class-validator';
import { IsValidEnumValue } from '../../../enum.validator';

export namespace ReferenceGetUsersByAnotherRole {
    export const topic = 'reference.get-users-by-another-role.query';

    export class Request {
        @IsNumber({}, { message: "Id пользователя должно быть числом" })
        userId!: number;

        @Validate(IsValidEnumValue, [UserRole])
        userRole!: UserRole;
    }

    export class Response {
        anotherUserIds!: number[] | IGetUserAndSubscriber[];
    }
}

export interface IGetUserAndSubscriber {
    anotherUserId: number;
    subscriber: IGetSubscriberInUser;
}

export interface IGetSubscriberInUser {
    id: number;
    address: string;
}