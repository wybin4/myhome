import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UnitEnitity } from '../entities/unit.entity';

@Injectable()
export class UnitRepository {
    constructor(
        @InjectRepository(UnitEnitity)
        private readonly unitRepository: Repository<UnitEnitity>,
    ) { }

    async createUnit(unit: UnitEnitity) {
        return this.unitRepository.save(unit);
    }

    async findUnitById(id: number) {
        return this.unitRepository.findOne({ where: { id } });
    }

}
