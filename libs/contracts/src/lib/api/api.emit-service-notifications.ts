import { IServiceNotification } from '@myhome/interfaces';

export namespace ApiEmitServiceNotifications {
    export const topic = 'api.emit-service-notifications.event';

    export class Request {
        notifications!: IServiceNotification[];
    }
}