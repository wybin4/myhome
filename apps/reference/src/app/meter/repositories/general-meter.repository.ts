import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Not, Repository } from 'typeorm';
import { GeneralMeterEnitity } from '../entities/general-meter.entity';
import { MeterStatus } from '@myhome/interfaces';

@Injectable()
export class GeneralMeterRepository {
    constructor(
        @InjectRepository(GeneralMeterEnitity)
        private readonly generalMeterRepository: Repository<GeneralMeterEnitity>,
    ) { }

    async createGeneralMeter(generalMeter: GeneralMeterEnitity) {
        return this.generalMeterRepository.save(generalMeter);
    }

    async findGeneralMeterById(id: number) {
        return this.generalMeterRepository.findOne({ where: { id } });
    }

    async findIndividualMeterByFNumber(factoryNumber: string) {
        return this.generalMeterRepository.findOne({ where: { factoryNumber } });
    }

    async updateGeneralMeter(meter: GeneralMeterEnitity) {
        await this.generalMeterRepository.update(meter.id, meter);
        return this.findGeneralMeterById(meter.id);
    }

    async findExpiredGeneralMeters(): Promise<GeneralMeterEnitity[]> {
        const currentDate = new Date();
        return this.generalMeterRepository.find({
            where: {
                verifiedAt: LessThan(currentDate),
                status: Not(MeterStatus.Archieve),
            },
        });
    }

    async saveGeneralMeters(meters: GeneralMeterEnitity[]): Promise<GeneralMeterEnitity[]> {
        return this.generalMeterRepository.save(meters);
    }
}
