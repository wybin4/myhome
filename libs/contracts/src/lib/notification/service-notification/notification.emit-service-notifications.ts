import { IServiceNotification } from '@myhome/interfaces';

export namespace EmitServiceNotifications {
    export const topic = 'notification.emit-service-notifications.event';

    export class Request {
        notifications!: IServiceNotification[];
    }
}

