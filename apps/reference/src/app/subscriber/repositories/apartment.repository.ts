import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ApartmentEntity } from '../entities/apartment.entity';
import { HOUSE_NOT_EXIST, RMQException, applyMeta } from '@myhome/constants';
import { IMeta, SubscriberStatus, UserRole } from '@myhome/interfaces';

@Injectable()
export class ApartmentRepository {
    constructor(
        @InjectRepository(ApartmentEntity)
        private readonly apartmentRepository: Repository<ApartmentEntity>,
    ) { }

    async create(apartment: ApartmentEntity) {
        try {
            return await this.apartmentRepository.save(apartment);
        } catch (error) {
            if (error.code === 'ER_NO_REFERENCED_ROW_2') {
                throw new RMQException(HOUSE_NOT_EXIST.message(apartment.houseId), HOUSE_NOT_EXIST.status);
            }
            throw error;
        }
    }

    async createMany(apartments: ApartmentEntity[]) {
        return await this.apartmentRepository.save(apartments);
    }

    async findById(id: number) {
        return await this.apartmentRepository.findOne({ where: { id } });
    }

    async findByIdWithHouse(apartmentIds: number[]) {
        return await this.apartmentRepository.createQueryBuilder('apartment')
            .innerJoinAndSelect('apartment.house', 'house')
            .where('apartment.id in (:...apartmentIds)', { apartmentIds })
            .getMany();
    }

    async findByNumber(data: { apatNumber: number; houseId: number }[]) {
        const queryBuilder = this.apartmentRepository.createQueryBuilder('apartment');

        const conditions = data.map(({ apatNumber, houseId }, index) => {
            queryBuilder.setParameter(`apatNumber${index}`, apatNumber);
            queryBuilder.setParameter(`houseId${index}`, houseId);
            return `(apartment.apartmentNumber = :apatNumber${index} AND apartment.houseId = :houseId${index})`;
        });

        const combinedConditions = conditions.join(' OR ');

        return await queryBuilder
            .where(combinedConditions)
            .getMany();
    }


    async findManyByHouse(houseId: number) {
        return await this.apartmentRepository.find({ where: { houseId } });
    }

    async findManyByHouses(houseIds: number[]) {
        return await this.apartmentRepository.find({ where: { houseId: In(houseIds) } });
    }

    async findMany(apartmentIds: number[]) {
        return await this.apartmentRepository.find({
            where: {
                id: In(apartmentIds),
            }
        });
    }

    async findWithSubscribersAndHouse(subscriberIds: number[]) {
        return await this.apartmentRepository.createQueryBuilder('apartment')
            .innerJoinAndSelect('apartment.subscriber', 'subscriber',
                'subscriber.status = :status', { status: SubscriberStatus.Active })
            .innerJoinAndSelect('apartment.house', 'house')
            .whereInIds(subscriberIds)
            .getMany();
    }

    async findWithSubscribers(subscriberIds: number[]) {
        return await this.apartmentRepository.createQueryBuilder('apartment')
            .innerJoinAndSelect('apartment.subscriber', 'subscriber',
                'subscriber.status = :status', { status: 'Active' })
            .whereInIds(subscriberIds)
            .getMany();
    }


    async findByUser(userId: number, userRole: UserRole, meta: IMeta) {
        let queryBuilder = this.apartmentRepository.createQueryBuilder('apartment');
        switch (userRole) {
            case UserRole.ManagementCompany: {
                queryBuilder.innerJoinAndSelect('apartment.house', 'house')
                    .where('house.managementCompanyId = :managementCompanyId', { managementCompanyId: userId });
                const { queryBuilder: newQueryBuilder, totalCount } = await applyMeta<ApartmentEntity>(queryBuilder, meta);
                queryBuilder = newQueryBuilder;
                return { apartments: await queryBuilder.getMany(), totalCount };
            }
            case UserRole.Owner: {
                queryBuilder.innerJoinAndSelect('apartment.subscriber', 'subscriber')
                    .where('subscriber.ownerId = :ownerId', { ownerId: userId })
                    .andWhere('subscriber.status = :status', { status: SubscriberStatus.Active });
                return { apartments: await queryBuilder.getMany(), totalCount: 0 };
            }
        }
    }

    async findByUserAll(userId: number, userRole: UserRole, meta: IMeta) {
        let queryBuilder = this.apartmentRepository.createQueryBuilder('apartment');
        switch (userRole) {
            case UserRole.ManagementCompany: {
                queryBuilder.innerJoinAndSelect('apartment.house', 'house')
                    .where('house.managementCompanyId = :managementCompanyId', { managementCompanyId: userId });
                const { queryBuilder: newQueryBuilder, totalCount } = await applyMeta<ApartmentEntity>(queryBuilder, meta);
                queryBuilder = newQueryBuilder;
                return { apartments: await queryBuilder.getMany(), totalCount };
            }
            case UserRole.Owner: {
                queryBuilder.innerJoinAndSelect('apartment.house', 'house')
                    .innerJoinAndSelect('apartment.subscriber', 'subscriber')
                    .where('subscriber.ownerId = :ownerId', { ownerId: userId })
                    .andWhere('subscriber.status = :status', { status: SubscriberStatus.Active });
                const { queryBuilder: newQueryBuilder, totalCount } = await applyMeta<ApartmentEntity>(queryBuilder, meta);
                queryBuilder = newQueryBuilder;
                return { apartments: await queryBuilder.getMany(), totalCount };
            }
        }
    }

}