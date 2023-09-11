import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, LessThan, Not, Repository } from 'typeorm';
import { GeneralMeterEntity } from '../entities/general-meter.entity';
import { MeterStatus } from '@myhome/interfaces';

@Injectable()
export class GeneralMeterRepository {
    constructor(
        @InjectRepository(GeneralMeterEntity)
        private readonly generalMeterRepository: Repository<GeneralMeterEntity>,
    ) { }

    async create(generalMeter: GeneralMeterEntity) {
        return this.generalMeterRepository.save(generalMeter);
    }

    async findById(id: number) {
        return this.generalMeterRepository.findOne({ where: { id } });
    }

    async findByFNumber(factoryNumber: string) {
        return this.generalMeterRepository.findOne({ where: { factoryNumber } });
    }

    async update(meter: GeneralMeterEntity) {
        await this.generalMeterRepository.update(meter.id, meter);
        return this.findById(meter.id);
    }

    async findExpiredGeneralMeters(): Promise<GeneralMeterEntity[]> {
        const currentDate = new Date();
        return this.generalMeterRepository.find({
            where: {
                verifiedAt: LessThan(currentDate),
                status: Not(MeterStatus.Archieve),
            },
        });
    }

    async findActiveGeneralMetersByHouse(houseId: number): Promise<GeneralMeterEntity[]> {
        return this.generalMeterRepository.find({
            where: {
                status: MeterStatus.Active,
                houseId: houseId
            },
        });
    }

    async saveMany(meters: GeneralMeterEntity[]): Promise<GeneralMeterEntity[]> {
        return this.generalMeterRepository.save(meters);
    }

    async findByHouseAndStatus(houseId: number, status: MeterStatus[]): Promise<GeneralMeterEntity[]> {
        return this.generalMeterRepository.find({
            where: {
                houseId,
                status: In(status),
            },
        });
    }

}
