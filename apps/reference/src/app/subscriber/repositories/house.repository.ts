import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HouseEnitity } from '../entities/house.entity';

@Injectable()
export class HouseRepository {
    constructor(
        @InjectRepository(HouseEnitity)
        private readonly houseRepository: Repository<HouseEnitity>,
    ) { }

    async createHouse(house: HouseEnitity) {
        return this.houseRepository.save(house);
    }

    async findHouseById(id: number) {
        return this.houseRepository.findOne({ where: { id } });
    }

    async deleteHouse(id: number): Promise<void> {
        await this.houseRepository.delete({ id });
    }

    async updateHouse(house: HouseEnitity) {
        await this.houseRepository.update(house.id, house);
        return this.findHouseById(house.id);
    }
}
