import { UserRole } from '@myhome/interfaces';
import { IsNumber, Validate } from 'class-validator';
import { IsValidEnumValue } from '../../../enum.validator';

export namespace EventUpdateAllServiceNotifications {
    export const topic = 'event.update-all-service-notifications.command';

    export class Request {
        @IsNumber({}, { message: "Id пользователя должен быть числом" })
        userId!: number;

        @Validate(IsValidEnumValue, [UserRole])
        userRole!: UserRole;
    }

    export class Response {
        userId!: number;
        userRole!: UserRole;
    }
}

