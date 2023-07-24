import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GeneralMeters } from '../entities/general-meter.entity';

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
}
