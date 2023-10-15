import { IHouseNotification } from "@myhome/interfaces";
import { IsNumber } from "class-validator";

export namespace GetHouseNotification {
    export const topic = 'notification.get-house-notification.query';

    export class Request {
        @IsNumber()
        id!: number;
    }

    export class Response {
        notification!: IHouseNotification;
    }
}
