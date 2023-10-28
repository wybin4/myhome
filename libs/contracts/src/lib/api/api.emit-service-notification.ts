import { IServiceNotification } from '@myhome/interfaces';

export namespace ApiEmitServiceNotification {
    export const topic = 'api.emit-service-notification.event';

    export class Request {
        notification!: IServiceNotification;
    }
}

