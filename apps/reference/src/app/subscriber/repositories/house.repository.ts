import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { HouseEntity } from '../entities/house.entity';

@Injectable()
export class HouseRepository {
    constructor(
        @InjectRepository(HouseEntity)
        private readonly houseRepository: Repository<HouseEntity>,
    ) { }

    async create(house: HouseEntity) {
        return this.houseRepository.save(house);
    }

    async findById(id: number) {
        return this.houseRepository.findOne({ where: { id } });
    }

    async findManyByMCId(managementCompanyId: number) {
        return this.houseRepository.find({ where: { managementCompanyId } });
    }

    async delete(id: number): Promise<void> {
        await this.houseRepository.delete({ id });
    }

    async update(house: HouseEntity) {
        await this.houseRepository.update(house.id, house);
        return this.findById(house.id);
    }

    async findMany(ids: number[]) {
        return this.houseRepository.find({
            where: {
                id: In(ids),
            }
        });
    }
}
