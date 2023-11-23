import { IServiceNotification } from '@myhome/interfaces';
import { IsNumber, } from 'class-validator';

export namespace EventUpdateServiceNotification {
    export const topic = 'event.update-service-notification.command';

    export class Request {
        @IsNumber({}, { message: "Id уведомления должно быть числом" })
        id!: number;
    }

    export class Response {
        notification!: IServiceNotification;
    }
}

