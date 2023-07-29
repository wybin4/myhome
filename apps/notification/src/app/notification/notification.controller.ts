import { Body, Controller, HttpStatus } from '@nestjs/common';
import { RMQError, RMQRoute, RMQValidate } from 'nestjs-rmq';
import { NotificationService } from './notification.service';
import { NotificationAddNotification, NotificationGetNotification, NotificationReadNotification } from '@myhome/contracts';
import { NotificationRepository } from './notification.repository';
import { NOTIFICATION_NOT_EXIST } from '@myhome/constants';
import { ERROR_TYPE } from 'nestjs-rmq/dist/constants';
import { NotificationEntity } from './notification.entity';

@Controller()
export class NotificationController {
    constructor(
        private readonly notificationService: NotificationService,
        private readonly notificationRepository: NotificationRepository
    ) { }

    @RMQValidate()
    @RMQRoute(NotificationGetNotification.topic)
    async getNotification(@Body() { id }: NotificationGetNotification.Request) {
        return this.notificationService.getNotification(id);
    }

    @RMQValidate()
    @RMQRoute(NotificationAddNotification.topic)
    async addNotification(@Body() dto: NotificationAddNotification.Request) {
        return this.notificationService.addNotification(dto);
    }

    @RMQValidate()
    @RMQRoute(NotificationReadNotification.topic)
    async readNotification(@Body() { id }: NotificationReadNotification.Request) {
        const notification = await this.notificationRepository.findNotificationById(id);
        if (!notification) {
            throw new RMQError(NOTIFICATION_NOT_EXIST, ERROR_TYPE.RMQ, HttpStatus.NOT_FOUND);
        }
        const newNotification = new NotificationEntity(notification).read();
        return { newNotification };
    }
}
