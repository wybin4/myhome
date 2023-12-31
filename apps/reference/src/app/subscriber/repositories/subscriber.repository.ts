import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { SubscriberEntity } from '../entities/subscriber.entity';
import { IMeta, SubscriberStatus, UserRole } from '@myhome/interfaces';
import { APART_NOT_EXIST, RMQException, applyMeta } from '@myhome/constants';

@Injectable()
export class SubscriberRepository {
    constructor(
        @InjectRepository(SubscriberEntity)
        private readonly subscriberRepository: Repository<SubscriberEntity>,
    ) { }

    async create(subscriber: SubscriberEntity) {
        try {
            return await this.subscriberRepository.save(subscriber);
        } catch (error) {
            if (error.code === 'ER_NO_REFERENCED_ROW_2') {
                throw new RMQException(APART_NOT_EXIST.message(subscriber.apartmentId), APART_NOT_EXIST.status);
            }
            throw error;
        }
    }

    async createMany(subscribers: SubscriberEntity[]) {
        return await this.subscriberRepository.save(subscribers);

    }

    async findById(id: number) {
        return await this.subscriberRepository.findOne({ where: { id } });
    }

    async findByIdAllInfo(id: number) {
        return await this.subscriberRepository.createQueryBuilder('subscriber')
            .innerJoinAndSelect('subscriber.apartment', 'apartment')
            .innerJoinAndSelect('apartment.house', 'house')
            .where('subscriber.id = :id', { id })
            .getOne();
    }

    async findByOwnerIdAllInfo(ownerId: number) {
        return await this.subscriberRepository.createQueryBuilder('subscriber')
            .innerJoinAndSelect('subscriber.apartment', 'apartment')
            .innerJoinAndSelect('apartment.house', 'house')
            .where('subscriber.ownerId = :ownerId', { ownerId })
            .getMany();
    }

    async findByIdsAllInfo(ids: number[]) {
        return await this.subscriberRepository.createQueryBuilder('subscriber')
            .innerJoinAndSelect('subscriber.apartment', 'apartment')
            .innerJoinAndSelect('apartment.house', 'house')
            .whereInIds(ids)
            .andWhere('subscriber.status = :status', { status: SubscriberStatus.Active })
            .getMany();
    }

    async findByUser(userId: number, userRole: UserRole, meta?: IMeta) {
        let queryBuilder = this.subscriberRepository.createQueryBuilder('subscriber');
        switch (userRole) {
            case UserRole.ManagementCompany: {
                queryBuilder.innerJoinAndSelect('subscriber.apartment', 'apartment')
                    .innerJoinAndSelect('apartment.house', 'house')
                    .where('house.managementCompanyId = :managementCompanyId', { managementCompanyId: userId })
                    .andWhere('subscriber.status = :status', { status: SubscriberStatus.Active });
                const { queryBuilder: newQueryBuilder, totalCount } = await applyMeta<SubscriberEntity>(queryBuilder, meta);
                queryBuilder = newQueryBuilder;
                return { subscribers: await queryBuilder.getMany(), totalCount };
            }
            case UserRole.Owner:
                return { subscribers: await this.subscriberRepository.find({ where: { ownerId: userId } }) };
        }
    }

    async findByUserByAnotherRole(userId: number, userRole: UserRole) {
        switch (userRole) {
            case UserRole.ManagementCompany:
                return await this.subscriberRepository.createQueryBuilder('subscriber')
                    .innerJoinAndSelect('subscriber.apartment', 'apartment')
                    .innerJoinAndSelect('apartment.house', 'house')
                    .where('house.managementCompanyId = :managementCompanyId', { managementCompanyId: userId })
                    .andWhere('subscriber.status = :status', { status: SubscriberStatus.Active })
                    .getMany();
            case UserRole.Owner:
                return await this.subscriberRepository.createQueryBuilder('subscriber')
                    .innerJoinAndSelect('subscriber.apartment', 'apartment')
                    .innerJoinAndSelect('apartment.house', 'house')
                    .where('subscriber.ownerId = :ownerId', { ownerId: userId })
                    .andWhere('subscriber.status = :status', { status: SubscriberStatus.Active })
                    .getMany();
        }
    }

    async findByMCIds(managementCompanyIds: number[]) {
        return await this.subscriberRepository.createQueryBuilder('subscriber')
            .innerJoinAndSelect('subscriber.apartment', 'apartment')
            .innerJoinAndSelect('apartment.house', 'house')
            .where('house.managementCompanyId in (:...managementCompanyIds)', { managementCompanyIds })
            .andWhere('subscriber.status = :status', { status: SubscriberStatus.Active })
            .getMany();
    }

    async findByApartmentIdAndPersonalAccount(subscribers: { apartmentId: number; personalAccount: string }[]) {
        const options = {
            where: subscribers.map(({ apartmentId, personalAccount }) => ({
                apartmentId,
                personalAccount,
            })),
            and: true,
        };

        return await this.subscriberRepository.find(options);
    }

    async update(subscriber: SubscriberEntity) {
        await this.subscriberRepository.update(subscriber.id, subscriber);
        return await this.findById(subscriber.id);
    }

    async findByHIds(houseIds: number[]) {
        return await this.subscriberRepository
            .createQueryBuilder('subscriber')
            .innerJoinAndSelect('subscriber.apartment', 'apartment')
            .innerJoin('apartment.house', 'house')
            .andWhere('subscriber.status = :status', { status: SubscriberStatus.Active })
            .where('house.id IN (:...houseIds)', { houseIds })
            .getMany();
    }

    async findIdsByApartmentIds(apartmentIds: number[]): Promise<number[]> {
        const subscribers = await this.subscriberRepository.find({
            where: {
                apartmentId: In(apartmentIds),
            },
            select: ['id'],
        });

        return subscribers.map(subscriber => subscriber.id);
    }

    async findManyByApartmentIds(apartmentIds: number[]) {
        return await this.subscriberRepository.find({
            where: {
                apartmentId: In(apartmentIds),
                status: SubscriberStatus.Active
            }
        });
    }

    async findManyWithApartments(ids: number[]) {
        return await this.subscriberRepository
            .createQueryBuilder('subscriber')
            .innerJoinAndSelect('subscriber.apartment', 'apartment')
            .innerJoin('apartment.house', 'house')
            .whereInIds(ids)
            .andWhere('subscriber.status = :status', { status: SubscriberStatus.Active })
            .getMany();
    }


    async findMany(subscriberIds: number[]) {
        return await this.subscriberRepository.find({
            where: {
                id: In(subscriberIds),
                status: SubscriberStatus.Active
            }
        });
    }


}
