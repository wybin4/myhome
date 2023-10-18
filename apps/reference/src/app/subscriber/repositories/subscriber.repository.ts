import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { SubscriberEntity } from '../entities/subscriber.entity';
import { SubscriberStatus } from '@myhome/interfaces';
import { APART_NOT_EXIST, RMQException } from '@myhome/constants';

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

    async findByIdsAllInfo(ids: number[]) {
        return await this.subscriberRepository.createQueryBuilder('subscriber')
            .innerJoinAndSelect('subscriber.apartment', 'apartment')
            .innerJoinAndSelect('apartment.house', 'house')
            .whereInIds(ids)
            .andWhere('subscriber.status = :status', { status: SubscriberStatus.Active })
            .getMany();
    }

    async findByMCId(managementCompanyId: number) {
        return await this.subscriberRepository.createQueryBuilder('subscriber')
            .innerJoinAndSelect('subscriber.apartment', 'apartment')
            .innerJoinAndSelect('apartment.house', 'house')
            .where('house.managementCompanyId = :managementCompanyId', { managementCompanyId })
            .andWhere('subscriber.status = :status', { status: SubscriberStatus.Active })
            .getMany();
    }

    async findByPersonalAccount(personalAccount: string) {
        return await this.subscriberRepository.findOne({ where: { personalAccount } });
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
