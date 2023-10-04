import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ApartmentEntity } from '../entities/apartment.entity';

@Injectable()
export class ApartmentRepository {
    constructor(
        @InjectRepository(ApartmentEntity)
        private readonly apartmentRepository: Repository<ApartmentEntity>,
    ) { }

    async create(apartment: ApartmentEntity) {
        return this.apartmentRepository.save(apartment);
    }

    async findById(id: number) {
        return this.apartmentRepository.findOne({ where: { id } });
    }

    async findByNumber(apatNumber: number, houseId: number) {
        return this.apartmentRepository
            .createQueryBuilder('apartment')
            .where('apartment.apartmentNumber = :apatNumber', { apatNumber })
            .andWhere('apartment.houseId = :houseId', { houseId })
            .getOne();
    }

    async findManyByHouse(houseId: number) {
        return this.apartmentRepository.find({ where: { houseId } });
    }

    async findManyByHouses(houseIds: number[]) {
        return this.apartmentRepository.find({ where: { houseId: In(houseIds) } });
    }

    async findMany(apartmentIds: number[]) {
        return this.apartmentRepository.find({
            where: {
                id: In(apartmentIds),
            }
        });
    }

    async findWithSubscribers(apartmentIds: number[]) {
        return this.apartmentRepository.createQueryBuilder('apartment')
            .innerJoinAndSelect('apartment.subscriber', 'subscriber')
            .where('apartment.id IN (:...apartmentIds)', { apartmentIds })
            .getMany();
    }
}
