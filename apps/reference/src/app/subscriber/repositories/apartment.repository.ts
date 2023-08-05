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

    async createApartment(apartment: ApartmentEntity) {
        return this.apartmentRepository.save(apartment);
    }

    async findApartmentById(id: number) {
        return this.apartmentRepository.findOne({ where: { id } });
    }

    async findApartmentByNumber(apatNumber: number, houseId: number) {
        return this.apartmentRepository
            .createQueryBuilder('apartment')
            .where('apartment.apartmentNumber = :apatNumber', { apatNumber })
            .andWhere('apartment.houseId = :houseId', { houseId })
            .getOne();
    }

    async deleteApartment(id: number): Promise<void> {
        await this.apartmentRepository.delete({ id });
    }

    async findAllByHouse(houseId: number) {
        return this.apartmentRepository.find({ where: { houseId } });
    }

    async findApartments(apartmentIds: number[]) {
        return this.apartmentRepository.find({
            where: {
                id: In(apartmentIds),
            }
        });
    }

    async findApartmentsWithSubscribers(apartmentIds: number[]) {
        return this.apartmentRepository.createQueryBuilder('apartment')
            .innerJoinAndSelect('apartment.subscriber', 'subscriber')
            .where('apartment.id IN (:...apartmentIds)', { apartmentIds })
            .getMany();
    }
}
