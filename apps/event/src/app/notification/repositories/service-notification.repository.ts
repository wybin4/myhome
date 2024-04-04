import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceNotificationEntity } from '../entities/service-notification.entity';
import { IMeta, NotificationStatus, UserRole } from '@myhome/interfaces';
import { applyMeta } from '@myhome/constants';

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

    async findByUserIdAndRoleWithMeta(userId: number, userRole: UserRole, meta: IMeta) {
        let queryBuilder = this.serviceNotificationRepository.createQueryBuilder('notification');
        queryBuilder = queryBuilder.where('notification.userId = :userId AND notification.userRole = :userRole', { userId, userRole })
            .orderBy('notification.createdAt', 'DESC');
        const { queryBuilder: newQueryBuilder, totalCount } = await applyMeta<ServiceNotificationEntity>(queryBuilder, meta);
        queryBuilder = newQueryBuilder;
        return { notifications: await queryBuilder.getMany(), totalCount };
    }

    async findByUserIdAndRoleUnread(userId: number, userRole: UserRole) {
        return await this.serviceNotificationRepository.count({
            where: {
                userId, userRole,
                status: NotificationStatus.Unread
            }
        });
    }

    async update(notification: ServiceNotificationEntity) {
        await this.serviceNotificationRepository.update(notification.id, notification);
        return await this.findById(notification.id);
    }

    async updateMany(notifications: ServiceNotificationEntity[]) {
        return await this.serviceNotificationRepository.save(notifications);
    }
}