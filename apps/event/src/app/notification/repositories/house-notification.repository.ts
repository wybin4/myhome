import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { HouseNotificationEntity } from '../entities/house-notification.entity';

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

    async findByHouseIds(houseIds: number[]) {
        return await this.houseNotificationRepository.find({
            where: { houseId: In(houseIds) },
            order: {
                createdAt: 'DESC',
            },
        });
    }

}