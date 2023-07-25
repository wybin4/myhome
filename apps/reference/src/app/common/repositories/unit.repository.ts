import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Not, Repository } from 'typeorm';
import { UnitEnitity } from '../entities/individual-meter.entity';
import { MeterStatus } from '@myhome/interfaces';

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

    async findUnitByFNumber(factoryNumber: string) {
        return this.unitRepository.findOne({ where: { factoryNumber } });
    }
    async updateUnit(meter: UnitEnitity) {
        await this.unitRepository.update(meter.id, meter);
        return this.findUnitById(meter.id);
    }
    async findExpiredUnits(): Promise<UnitEnitity[]> {
        const currentDate = new Date();
        return this.unitRepository.find({
            where: {
                verifiedAt: LessThan(currentDate),
                status: Not(MeterStatus.Archieve),
            },
        });
    }
    async saveUnits(meters: UnitEnitity[]): Promise<UnitEnitity[]> {
        return this.unitRepository.save(meters);
    }
}
