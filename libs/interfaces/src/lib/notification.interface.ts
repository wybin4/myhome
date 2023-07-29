import { UserRole } from "./account/user.interface";

export interface INotification {
    id?: number;
    userId: number;
    userRole: UserRole;
    notificationType: NotificationType;
    message: string;
    createdAt: Date;
    readAt?: Date;
    status: NotificationStatus;
}

export enum NotificationStatus {
    Read = 'Read',
    Unread = 'Unread',
}

export enum NotificationType {
    SentAppeal = 'Отправлено обращение',
}