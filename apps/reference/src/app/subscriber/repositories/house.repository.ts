import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { HouseEntity } from '../entities/house.entity';
import { SubscriberStatus } from '@myhome/interfaces';

@Injectable()
export class HouseRepository {
    constructor(
        @InjectRepository(HouseEntity)
        private readonly houseRepository: Repository<HouseEntity>,
    ) { }

    async create(house: HouseEntity) {
        return await this.houseRepository.save(house);
    }

    async findById(id: number) {
        return await this.houseRepository.findOne({ where: { id } });
    }

    async findByMCId(managementCompanyId: number) {
        return await this.houseRepository.find({ where: { managementCompanyId } });
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

    async findWithSubscribers(houseId: number) {
        return await this.houseRepository
            .createQueryBuilder('house')
            .innerJoinAndSelect('house.apartments', 'apartment')
            .innerJoinAndSelect('apartment.subscriber', 'subscriber')
            .where('house.id = :houseId', { houseId })
            .andWhere('subscriber.status = :status', { status: SubscriberStatus.Active })
            .getOne();
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
