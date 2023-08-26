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

    async createHouse(house: HouseEntity) {
        return this.houseRepository.save(house);
    }

    async findHouseById(id: number) {
        return this.houseRepository.findOne({ where: { id } });
    }

    async deleteHouse(id: number): Promise<void> {
        await this.houseRepository.delete({ id });
    }

    async updateHouse(house: HouseEntity) {
        await this.houseRepository.update(house.id, house);
        return this.findHouseById(house.id);
    }

    async findHouses(ids: number[]) {
        return this.houseRepository.find({
            where: {
                id: In(ids),
            }
        });
    }
}
