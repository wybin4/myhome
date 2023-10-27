import { IServiceNotification } from '@myhome/interfaces';

export namespace EmitServiceNotification {
    export const topic = 'notification.emit-service-notification.event';

    export class Request {
        notification!: IServiceNotification;
    }
}

