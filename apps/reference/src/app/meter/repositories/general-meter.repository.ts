import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Not, Repository } from 'typeorm';
import { GeneralMeterEntity } from '../entities/general-meter.entity';
import { MeterStatus } from '@myhome/interfaces';

@Injectable()
export class GeneralMeterRepository {
    constructor(
        @InjectRepository(GeneralMeterEntity)
        private readonly generalMeterRepository: Repository<GeneralMeterEntity>,
    ) { }

    async createGeneralMeter(generalMeter: GeneralMeterEntity) {
        return this.generalMeterRepository.save(generalMeter);
    }

    async findGeneralMeterById(id: number) {
        return this.generalMeterRepository.findOne({ where: { id } });
    }

    async findIndividualMeterByFNumber(factoryNumber: string) {
        return this.generalMeterRepository.findOne({ where: { factoryNumber } });
    }

    async updateGeneralMeter(meter: GeneralMeterEntity) {
        await this.generalMeterRepository.update(meter.id, meter);
        return this.findGeneralMeterById(meter.id);
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

    async saveGeneralMeters(meters: GeneralMeterEntity[]): Promise<GeneralMeterEntity[]> {
        return this.generalMeterRepository.save(meters);
    }
}
