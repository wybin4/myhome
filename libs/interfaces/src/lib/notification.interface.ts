import { UserRole } from "./account/user.interface";

export interface IHouseNotification {
    id?: number;
    houseId: number;
    title: string;
    type: HouseNotificationType;
    createdAt: Date;
    text: string;
}

export interface IServiceNotification {
    id?: number;
    userId: number;
    userRole: UserRole;
    title: string;
    description?: string;
    text: string;
    type: ServiceNotificationType;
    createdAt: Date;
    readAt?: Date;
    status: NotificationStatus;
}

export enum NotificationStatus {
    Read = 'Read',
    Unread = 'Unread',
}

export enum HouseNotificationType {
    Accident = 'Accident',
    EngineeringWorks = 'EngineeringWorks',
    Other = 'Other'
}

export enum ServiceNotificationType {
    Appeal = 'Appeal',
    HouseNotification = 'HouseNotification',
    Meter = 'Meter'
}