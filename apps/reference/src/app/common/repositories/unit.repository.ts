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
        return await this.unitRepository.save(unit);
    }

    async findUnitById(id: number) {
        return await this.unitRepository.findOne({ where: { id } });
    }

    async findAll() {
        return await this.unitRepository.find();
    }

}
