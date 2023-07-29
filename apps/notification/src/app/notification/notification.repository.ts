import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationEntity } from './notification.entity';

@Injectable()
export class NotificationRepository {
    constructor(
        @InjectRepository(NotificationEntity)
        private readonly notificationRepository: Repository<NotificationEntity>,
    ) { }

    async createNotification(Notification: NotificationEntity) {
        return this.notificationRepository.save(Notification);
    }

    async findNotificationById(id: number) {
        return this.notificationRepository.findOne({ where: { id } });
    }

    async readNotification(notification: NotificationEntity) {
        await this.notificationRepository.update(notification.id, notification);
        return this.findNotificationById(notification.id);
    }
}