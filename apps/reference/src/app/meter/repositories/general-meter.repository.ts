import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Not, Repository } from 'typeorm';
import { GeneralMeters } from '../entities/general-meter.entity';
import { MeterStatus } from '@myhome/interfaces';

@Injectable()
export class GeneralMeterRepository {
    constructor(
        @InjectRepository(GeneralMeters)
        private readonly generalMeterRepository: Repository<GeneralMeters>,
    ) { }

    async createGeneralMeter(generalMeter: GeneralMeters) {
        return this.generalMeterRepository.save(generalMeter);
    }

    async findGeneralMeterById(id: number) {
        return this.generalMeterRepository.findOne({ where: { id } });
    }

    async findIndividualMeterByFNumber(factoryNumber: string) {
        return this.generalMeterRepository.findOne({ where: { factoryNumber } });
    }

    async updateGeneralMeter(meter: GeneralMeters) {
        await this.generalMeterRepository.update(meter.id, meter);
        return this.findGeneralMeterById(meter.id);
    }

    async findExpiredGeneralMeters(): Promise<GeneralMeters[]> {
        const currentDate = new Date();
        return this.generalMeterRepository.find({
            where: {
                verifiedAt: LessThan(currentDate),
                status: Not(MeterStatus.Archieve),
            },
        });
    }

    async saveGeneralMeters(meters: GeneralMeters[]): Promise<GeneralMeters[]> {
        return this.generalMeterRepository.save(meters);
    }
}
