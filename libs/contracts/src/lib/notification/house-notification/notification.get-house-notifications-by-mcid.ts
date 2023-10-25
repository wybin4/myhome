import { IHouseNotification } from "@myhome/interfaces";
import { IsNumber } from "class-validator";

export namespace GetHouseNotificationsByMCId {
    export const topic = 'notification.get-house-notifications-by-mcid.query';

    export class Request {
        @IsNumber({}, { message: "Id управляющей компании должен быть числом" })
        managementCompanyId!: number;
    }

    export class Response {
        notifications!: IGetHouseNotificationsByMCId[];
    }
}

interface IGetHouseNotificationsByMCId extends IHouseNotification {
    houseName: string;
}