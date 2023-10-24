import { IServiceNotification } from '@myhome/interfaces';
import { IsNumber, } from 'class-validator';

export namespace UpdateServiceNotification {
    export const topic = 'notification.update-service-notification.command';

    export class Request {
        @IsNumber()
        id!: number;
    }

    export class Response {
        notification!: IServiceNotification;
    }
}

