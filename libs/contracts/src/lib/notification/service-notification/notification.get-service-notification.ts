import { IServiceNotification } from '@myhome/interfaces';

export namespace GetServiceNotification {
    export const topic = 'notification.get-service-notification.event';

    export class Request {
        notification!: IServiceNotification;
    }
}

