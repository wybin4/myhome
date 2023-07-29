import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationStatus } from '@myhome/interfaces';
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

    async readNotification(id: number): Promise<NotificationEntity | undefined> {
        const notification = await this.findNotificationById(id);
        if (notification) {
            notification.status = NotificationStatus.Read;
            return this.notificationRepository.save(notification);
        }
        return undefined;
    }
}