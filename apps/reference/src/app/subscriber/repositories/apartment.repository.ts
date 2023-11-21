import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ApartmentEntity } from '../entities/apartment.entity';
import { HOUSE_NOT_EXIST, RMQException } from '@myhome/constants';
import { SubscriberStatus, UserRole } from '@myhome/interfaces';

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

    async findById(id: number) {
        return await this.apartmentRepository.findOne({ where: { id } });
    }

    async findByIdWithHouse(apartmentId: number) {
        return await this.apartmentRepository.createQueryBuilder('apartment')
            .innerJoinAndSelect('apartment.house', 'house')
            .where('apartment.id = :apartmentId', { apartmentId })
            .getOne();
    }

    async findByNumber(apatNumber: number, houseId: number) {
        return await this.apartmentRepository
            .createQueryBuilder('apartment')
            .where('apartment.apartmentNumber = :apatNumber', { apatNumber })
            .andWhere('apartment.houseId = :houseId', { houseId })
            .getOne();
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

    async findByUser(userId: number, userRole: UserRole) {
        switch (userRole) {
            case UserRole.ManagementCompany:
                return await this.apartmentRepository.createQueryBuilder('apartment')
                    .innerJoinAndSelect('apartment.house', 'house')
                    .where('house.managementCompanyId = :managementCompanyId', { managementCompanyId: userId })
                    .getMany();
            case UserRole.Owner:
                return await this.apartmentRepository
                    .createQueryBuilder('apartment')
                    .innerJoinAndSelect('apartment.subscriber', 'subscriber')
                    .where('subscriber.ownerId = :ownerId', { ownerId: userId })
                    .andWhere('subscriber.status = :status', { status: SubscriberStatus.Active })
                    .getMany();
        }
    }

    async findByUserAll(userId: number, userRole: UserRole) {
        switch (userRole) {
            case UserRole.ManagementCompany:
                return await this.apartmentRepository.createQueryBuilder('apartment')
                    .innerJoinAndSelect('apartment.house', 'house')
                    .where('house.managementCompanyId = :managementCompanyId', { managementCompanyId: userId })
                    .getMany();
            case UserRole.Owner:
                return await this.apartmentRepository
                    .createQueryBuilder('apartment')
                    .innerJoinAndSelect('apartment.house', 'house')
                    .innerJoinAndSelect('apartment.subscriber', 'subscriber')
                    .where('subscriber.ownerId = :ownerId', { ownerId: userId })
                    .andWhere('subscriber.status = :status', { status: SubscriberStatus.Active })
                    .getMany();
        }
    }

}
