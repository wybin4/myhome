import { IServiceNotification, UserRole } from "@myhome/interfaces";
import { IsNumber, Validate } from "class-validator";
import { IsValidEnumValue } from "../../enum.validator";

export namespace GetServiceNotifications {
    export const topic = 'notification.get-service-notifications.query';

    export class Request {
        @IsNumber({}, { message: "Id пользователя должно быть числом" })
        userId!: number;

        @Validate(IsValidEnumValue, [UserRole])
        userRole!: UserRole;
    }

    export class Response {
        notifications!: IServiceNotification[];
    }
}