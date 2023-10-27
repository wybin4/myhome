import { IServiceNotification } from '@myhome/interfaces';

export namespace EventEmitServiceNotifications {
    export const topic = 'event.emit-service-notifications.event';

    export class Request {
        notifications!: IServiceNotification[];
    }
}

