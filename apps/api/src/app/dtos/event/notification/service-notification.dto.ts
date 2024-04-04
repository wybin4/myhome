import { ServiceNotificationType } from "@myhome/interfaces";

export class GetServiceNotificationsDto { }

export class AddServiceNotificationDto { 
    title: string;
    description?: string;
    text: string;
    type: ServiceNotificationType;
}

export class UpdateServiceNotificationDto {
    id!: number;
}

export class UpdateAllServiceNotificationsDto { }
