import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { HouseEntity } from '../entities/house.entity';
import { IMeta, SubscriberStatus, UserRole } from '@myhome/interfaces';
import { applyMeta } from '@myhome/constants';

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

    async findByUser(userId: number, userRole: UserRole, meta: IMeta) {
        let queryBuilder = this.houseRepository.createQueryBuilder('house');
        switch (userRole) {
            case UserRole.ManagementCompany: {
                queryBuilder.where('house.managementCompanyId = :managementCompanyId', { managementCompanyId: userId });
                const { queryBuilder: newQueryBuilder, totalCount } = await applyMeta<HouseEntity>(queryBuilder, meta);
                queryBuilder = newQueryBuilder;
                return { houses: await queryBuilder.getMany(), totalCount };
            }
            case UserRole.Owner: {
                queryBuilder.innerJoinAndSelect('house.apartments', 'apartment')
                    .innerJoinAndSelect('apartment.subscriber', 'subscriber')
                    .where('subscriber.ownerId = :ownerId', { ownerId: userId })
                    .andWhere('subscriber.status = :status', { status: SubscriberStatus.Active });
                return { houses: await queryBuilder.getMany(), totalCount: 0 };
            }
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
