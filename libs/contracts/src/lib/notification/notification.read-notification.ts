import { INotification } from "@myhome/interfaces";
import { IsNumber } from "class-validator";

export namespace NotificationReadNotification {
    export const topic = 'notification.read-notification.command';

    export class Request {
        @IsNumber()
        id!: number;
    }

    export class Response {
        notification!: INotification;
    }
}
