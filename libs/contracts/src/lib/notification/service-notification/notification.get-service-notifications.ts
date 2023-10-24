import { IServiceNotification, UserRole } from "@myhome/interfaces";
import { IsNumber, IsString } from "class-validator";

export namespace GetServiceNotifications {
    export const topic = 'notification.get-service-notifications.query';

    export class Request {
        @IsNumber()
        userId!: number;

        @IsString()
        userRole!: UserRole;
    }

    export class Response {
        notifications!: IServiceNotification[];
    }
}