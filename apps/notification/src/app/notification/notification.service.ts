import { HttpStatus, Injectable } from "@nestjs/common";
import { NotificationRepository } from "./notification.repository";
import { RMQError, RMQService } from "nestjs-rmq";
import { ERROR_TYPE } from "nestjs-rmq/dist/constants";
import { NotificationEntity } from "./notification.entity";
import { NOTIFICATION_NOT_EXIST, USER_NOT_EXIST } from "@myhome/constants";
import { NotificationAddNotification, AccountUserInfo } from "@myhome/contracts";

@Injectable()
export class NotificationService {
    constructor(
        private readonly notificationRepository: NotificationRepository,
        private readonly rmqService: RMQService,
    ) { }

    public async getNotification(id: number) {
        const notification = await this.notificationRepository.findNotificationById(id);
        if (!notification) {
            throw new RMQError(NOTIFICATION_NOT_EXIST, ERROR_TYPE.RMQ, HttpStatus.NOT_FOUND);
        }
        const gettedNotification = new NotificationEntity(notification);
        return { gettedNotification };
    }

    public async addNotification(dto: NotificationAddNotification.Request) {
        try {
            await this.rmqService.send
                <AccountUserInfo.Request, AccountUserInfo.Response>
                (AccountUserInfo.topic, { id: dto.userId, role: dto.userRole });
        } catch (e) {
            throw new RMQError(USER_NOT_EXIST, ERROR_TYPE.RMQ, HttpStatus.NOT_FOUND);
        }
        const newNotificationEntity = new NotificationEntity({
            userId: dto.userId,
            userRole: dto.userRole,
            notificationType: dto.notificationType,
            message: dto.message,
            createdAt: new Date(dto.createdAt),
        });
        const newNotification = await this.notificationRepository.createNotification(newNotificationEntity);
        return { newNotification };
    }
}