import { INotification, NotificationType, UserRole } from '@myhome/interfaces';
import { IsNumber, IsString } from 'class-validator';

export namespace NotificationAddNotification {
    export const topic = 'notification.add-notification.command';

    export class Request {
        @IsNumber()
        userId!: number;

        @IsString()
        userRole!: UserRole;

        @IsString()
        notificationType!: NotificationType;

        @IsString()
        message!: string;

        @IsString()
        createdAt!: string;
    }

    export class Response {
        notification!: INotification;
    }
}

