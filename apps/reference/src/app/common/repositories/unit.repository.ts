import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UnitEntity } from '../entities/unit.entity';

@Injectable()
export class UnitRepository {
    constructor(
        @InjectRepository(UnitEntity)
        private readonly unitRepository: Repository<UnitEntity>,
    ) { }

    async createUnit(unit: UnitEntity) {
        return this.unitRepository.save(unit);
    }

    async findUnitById(id: number) {
        return this.unitRepository.findOne({ where: { id } });
    }

}
