import { UserRole } from "@myhome/interfaces";
import { IsNumber, Validate } from "class-validator";
import { IsValidEnumValue } from '../../../enum.validator';

export namespace EventGetUnreadServiceNotifications {
    export const topic = 'event.get-unread-service-notifications.query';

    export class Request {
        @IsNumber({}, { message: "Id пользователя должно быть числом" })
        userId!: number;

        @Validate(IsValidEnumValue, [UserRole])
        userRole!: UserRole;
    }

    export class Response {
        hasUnreadNotifications!: number;
    }
}