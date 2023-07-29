import { INotification } from "@myhome/interfaces";
import { IsNumber } from "class-validator";

export namespace GetNotification {
    export const topic = 'notification.get-notification.query';

    export class Request {
        @IsNumber()
        id!: number;
    }

    export class Response {
        notification!: INotification;
    }
}
