import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HouseNotificationEntity } from '../entities/house-notification.entity';
import { IMeta } from '@myhome/interfaces';
import { applyMeta } from '@myhome/constants';

@Injectable()
export class HouseNotificationRepository {
    constructor(
        @InjectRepository(HouseNotificationEntity)
        private readonly houseNotificationRepository: Repository<HouseNotificationEntity>,
    ) { }

    async create(Notification: HouseNotificationEntity) {
        return await this.houseNotificationRepository.save(Notification);
    }

    async findById(id: number) {
        return await this.houseNotificationRepository.findOne({ where: { id } });
    }

    async findByHouseIds(houseIds: number[], meta: IMeta) {
        let queryBuilder = this.houseNotificationRepository.createQueryBuilder('houseNotification');
        queryBuilder.where('houseNotification.houseId IN (:...houseIds)', { houseIds })
            .orderBy('houseNotification.createdAt', 'DESC');
        const { queryBuilder: newQueryBuilder, totalCount } = await applyMeta<HouseNotificationEntity>(queryBuilder, meta);
        queryBuilder = newQueryBuilder;
        return { notifications: await queryBuilder.getMany(), totalCount };
    }


}