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
        return this.houseNotificationRepository.save(Notification);
    }

    async findById(id: number) {
        return this.houseNotificationRepository.findOne({ where: { id } });
    }

    async findByHouseIds(houseIds: number[]) {
        return this.houseNotificationRepository.find({ where: { houseId: In(houseIds) } });
    }

}