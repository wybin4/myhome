import { IHouseNotification } from "@myhome/interfaces";
import { IsNumber } from "class-validator";

export namespace EventGetHouseNotification {
    export const topic = 'event.get-house-notification.query';

    export class Request {
        @IsNumber({}, { message: "Id уведомления должно быть числом" })
        id!: number;
    }

    export class Response {
        notification!: IHouseNotification;
    }
}
