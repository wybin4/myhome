import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApartmentEnitity } from '../entities/apartment.entity';

@Injectable()
export class ApartmentRepository {
    constructor(
        @InjectRepository(ApartmentEnitity)
        private readonly apartmentRepository: Repository<ApartmentEnitity>,
    ) { }

    async createApartment(apartment: ApartmentEnitity) {
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
}
