import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { HouseEntity } from '../entities/house.entity';
import { SubscriberStatus, UserRole } from '@myhome/interfaces';

@Injectable()
export class HouseRepository {
    constructor(
        @InjectRepository(HouseEntity)
        private readonly houseRepository: Repository<HouseEntity>,
    ) { }

    async create(house: HouseEntity) {
        return await this.houseRepository.save(house);
    }

    async createMany(houses: HouseEntity[]) {
        return await this.houseRepository.save(houses);
    }

    async findById(id: number) {
        return await this.houseRepository.findOne({ where: { id } });
    }

    async findByUser(userId: number, userRole: UserRole) {
        switch (userRole) {
            case UserRole.ManagementCompany:
                return await this.houseRepository.find({ where: { managementCompanyId: userId } });
            case UserRole.Owner:
                return await this.houseRepository
                    .createQueryBuilder('house')
                    .innerJoinAndSelect('house.apartments', 'apartment')
                    .innerJoinAndSelect('apartment.subscriber', 'subscriber')
                    .where('subscriber.ownerId = :ownerId', { ownerId: userId })
                    .andWhere('subscriber.status = :status', { status: SubscriberStatus.Active })
                    .getMany();
        }
    }

    async findManyWithSubscribers(houseIds: number[]) {
        return await this.houseRepository
            .createQueryBuilder('house')
            .innerJoinAndSelect('house.apartments', 'apartment')
            .innerJoinAndSelect('apartment.subscriber', 'subscriber')
            .where('house.id IN (:...houseIds)', { houseIds })
            .andWhere('subscriber.status = :status', { status: SubscriberStatus.Active })
            .getMany();
    }

    async findWithSubscribers(houseIds: number[]) {
        return await this.houseRepository
            .createQueryBuilder('house')
            .innerJoinAndSelect('house.apartments', 'apartment')
            .innerJoinAndSelect('apartment.subscriber', 'subscriber')
            .where('house.id in (:...houseIds)', { houseIds })
            .andWhere('subscriber.status = :status', { status: SubscriberStatus.Active })
            .getMany();
    }

    async delete(id: number): Promise<void> {
        await this.houseRepository.delete({ id });
    }

    async update(house: HouseEntity) {
        await this.houseRepository.update(house.id, house);
        return await this.findById(house.id);
    }

    async findMany(ids: number[]) {
        return await this.houseRepository.find({
            where: {
                id: In(ids),
            }
        });
    }
}
