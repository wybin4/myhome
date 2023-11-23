import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceNotificationEntity } from '../entities/service-notification.entity';
import { UserRole } from '@myhome/interfaces';

@Injectable()
export class ServiceNotificationRepository {
    constructor(
        @InjectRepository(ServiceNotificationEntity)
        private readonly serviceNotificationRepository: Repository<ServiceNotificationEntity>,
    ) { }

    async create(notification: ServiceNotificationEntity) {
        return await this.serviceNotificationRepository.save(notification);
    }

    async createMany(notifications: ServiceNotificationEntity[]) {
        return await this.serviceNotificationRepository.save(notifications);
    }

    async findById(id: number) {
        return await this.serviceNotificationRepository.findOne({ where: { id } });
    }

    async findByUserIdAndRole(userId: number, userRole: UserRole) {
        return await this.serviceNotificationRepository.find({ where: { userId, userRole } });
    }

    async update(notification: ServiceNotificationEntity) {
        await this.serviceNotificationRepository.update(notification.id, notification);
        return await this.findById(notification.id);
    }

    async updateMany(notifications: ServiceNotificationEntity[]) {
        return await this.serviceNotificationRepository.save(notifications);
    }
}