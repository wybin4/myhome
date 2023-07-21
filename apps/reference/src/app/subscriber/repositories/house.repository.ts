import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Houses } from '../entities/house.entity';

@Injectable()
export class HouseRepository {
    constructor(
        @InjectRepository(Houses)
        private readonly houseRepository: Repository<Houses>,
    ) { }

    async createHouse(house: Houses) {
        return this.houseRepository.save(house);
    }

    async findHouseById(id: number) {
        return this.houseRepository.findOne({ where: { id } });
    }

    async deleteHouse(id: number): Promise<void> {
        await this.houseRepository.delete({ id });
    }

    async updateHouse(house: Houses) {
        await this.houseRepository.update(house.id, house);
        return this.findHouseById(house.id);
    }
}
