import { IServiceNotification } from '@myhome/interfaces';

export namespace EventEmitServiceNotification {
    export const topic = 'event.emit-service-notification.event';

    export class Request {
        notification!: IServiceNotification;
    }
}

