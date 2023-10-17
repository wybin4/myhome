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
    message: string;
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