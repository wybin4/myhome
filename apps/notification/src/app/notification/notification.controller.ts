import { Body, Controller, HttpStatus } from '@nestjs/common';
import { RMQError, RMQRoute, RMQValidate } from 'nestjs-rmq';
import { NotificationService } from './notification.service';
import { AddNotification, GetNotification, ReadNotification } from '@myhome/contracts';
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
    @RMQRoute(GetNotification.topic)
    async getNotification(@Body() { id }: GetNotification.Request) {
        return this.notificationService.getNotification(id);
    }

    @RMQValidate()
    @RMQRoute(AddNotification.topic)
    async addNotification(@Body() dto: AddNotification.Request) {
        try {
            return this.notificationService.addNotification(dto);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.code);
        }
    }

    @RMQValidate()
    @RMQRoute(ReadNotification.topic)
    async readNotification(@Body() { id }: ReadNotification.Request) {
        const notification = await this.notificationRepository.findNotificationById(id);
        if (!notification) {
            throw new RMQError(NOTIFICATION_NOT_EXIST, ERROR_TYPE.RMQ, HttpStatus.NOT_FOUND);
        }
        const notificationEntity = new NotificationEntity(notification).read();
        return Promise.all([
            this.notificationRepository.readNotification(await notificationEntity),
        ]);
    }
}
