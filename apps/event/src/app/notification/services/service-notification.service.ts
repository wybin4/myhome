import { EventGetUnreadServiceNotifications, EventGetServiceNotifications, EventAddServiceNotification, EventUpdateServiceNotification, EventAddServiceNotifications, EventUpdateAllServiceNotifications } from "@myhome/contracts";
import { Injectable } from "@nestjs/common";
import { ServiceNotificationRepository } from "../repositories/service-notification.repository";
import { NOTIFICATIONS_NOT_EXIST, NOTIFICATION_NOT_EXIST, RMQException } from "@myhome/constants";
import { ServiceNotificationEntity } from "../entities/service-notification.entity";
import { NotificationStatus } from "@myhome/interfaces";
import { ServiceNotificationEventEmitter } from "../service-notification.event-emitter";

@Injectable()
export class ServiceNotificationService {
    constructor(
        private readonly serviceNotificationRepository: ServiceNotificationRepository,
        private readonly eventEmitter: ServiceNotificationEventEmitter
    ) { }

    public async getServiceNotifications(dto: EventGetServiceNotifications.Request):
        Promise<EventGetServiceNotifications.Response> {
        const { notifications } = await this.serviceNotificationRepository.findByUserIdAndRoleWithMeta(
            dto.userId, dto.userRole, dto.meta
        );
        if (!notifications || !notifications.length) {
            return { notifications: [] };
        }
        return { notifications };
    }

    public async getUnreadServiceNotifications(dto: EventGetUnreadServiceNotifications.Request):
        Promise<EventGetUnreadServiceNotifications.Response> {
        const hasUnreadNotifications = await this.serviceNotificationRepository.findByUserIdAndRoleUnread(
            dto.userId,
            dto.userRole
        );
        return { hasUnreadNotifications: hasUnreadNotifications > 0 ? 1 : 0 };
    }

    public async addServiceNotification(dto: EventAddServiceNotification.Request):
        Promise<EventAddServiceNotification.Response> {
        const notificationEntity = new ServiceNotificationEntity({
            status: NotificationStatus.Unread,
            createdAt: new Date(),
            ...dto
        });
        const notification = await this.serviceNotificationRepository.create(notificationEntity);

        return { notification };
    }

    public async addServiceNotifications(dto: EventAddServiceNotifications.Request):
        Promise<EventAddServiceNotifications.Response> {
        const notificationEntities = dto.userIds.map(userId =>
            new ServiceNotificationEntity({
                status: NotificationStatus.Unread,
                createdAt: new Date(),
                userId: userId,
                ...dto
            })
        )
        const notifications = await this.serviceNotificationRepository.createMany(notificationEntities);
        await this.eventEmitter.handleMany(notifications);

        return { notifications };
    }

    public async updateServiceNotification(dto: EventUpdateServiceNotification.Request):
        Promise<EventUpdateServiceNotification.Response> {
        const existedNotification = await this.serviceNotificationRepository.findById(dto.id);
        if (!existedNotification) {
            throw new RMQException(NOTIFICATION_NOT_EXIST.message(dto.id), NOTIFICATION_NOT_EXIST.status);
        }
        const notification = new ServiceNotificationEntity(existedNotification).
            update(NotificationStatus.Read);
        await this.serviceNotificationRepository.update(notification);
        return { notification };
    }

    public async updateAllServiceNotifications(dto: EventUpdateAllServiceNotifications.Request)
        : Promise<EventUpdateAllServiceNotifications.Response> {
        const existedNotifications = await this.serviceNotificationRepository.findByUserIdAndRole(dto.userId, dto.userRole);
        if (!existedNotifications.length) {
            throw new RMQException(NOTIFICATIONS_NOT_EXIST.message, NOTIFICATIONS_NOT_EXIST.status);
        }
        const notifications = existedNotifications.map(notification =>
            new ServiceNotificationEntity(notification).update(NotificationStatus.Read)
        );
        await this.serviceNotificationRepository.updateMany(notifications);
        return {
            userId: dto.userId,
            userRole: dto.userRole
        };
    }

}