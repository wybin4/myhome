import { GetServiceNotifications, AddServiceNotification, UpdateServiceNotification } from "@myhome/contracts";
import { Injectable } from "@nestjs/common";
import { RMQService } from "nestjs-rmq";
import { ServiceNotificationRepository } from "../repositories/service-notification.repository";
import { NOTIFICATION_NOT_EXIST, RMQException, checkUser } from "@myhome/constants";
import { ServiceNotificationEntity } from "../entities/service-notification.entity";
import { NotificationStatus } from "@myhome/interfaces";
import { ServiceNotificationEventEmitter } from "../service-notification.event-emitter";

@Injectable()
export class ServiceNotificationService {
    constructor(
        private readonly serviceNotificationRepository: ServiceNotificationRepository,
        private readonly rmqService: RMQService,
        private readonly eventEmitter: ServiceNotificationEventEmitter
    ) { }

    public async getServiceNotifications(dto: GetServiceNotifications.Request):
        Promise<GetServiceNotifications.Response> {
        await checkUser(this.rmqService, dto.userId, dto.userRole);
        const notifications = await this.serviceNotificationRepository.findByUserIdAndRole(
            dto.userId,
            dto.userRole
        );
        if (!notifications.length) {
            return;
        }
        return { notifications };
    }

    public async addServiceNotification(dto: AddServiceNotification.Request):
        Promise<AddServiceNotification.Response> {
        await checkUser(this.rmqService, dto.userId, dto.userRole);

        const notificationEntity = new ServiceNotificationEntity({
            status: NotificationStatus.Unread,
            createdAt: new Date(),
            ...dto
        });
        const notification = await this.serviceNotificationRepository.create(notificationEntity);

        await this.eventEmitter.handle(notification);
        return { notification };
    }

    public async updateServiceNotification(dto: UpdateServiceNotification.Request):
        Promise<UpdateServiceNotification.Response> {
        const existedNotification = await this.serviceNotificationRepository.findById(dto.id);
        if (!existedNotification) {
            throw new RMQException(NOTIFICATION_NOT_EXIST.message(dto.id), NOTIFICATION_NOT_EXIST.status);
        }
        const notification = await new ServiceNotificationEntity(existedNotification).
            update(NotificationStatus.Read);
        return { notification };
    }

}