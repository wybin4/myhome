import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IndividualMeters } from '../entities/individual-meter.entity';

@Injectable()
export class IndividualMeterRepository {
    constructor(
        @InjectRepository(IndividualMeters)
        private readonly individualMeterRepository: Repository<IndividualMeters>,
    ) { }

    async createIndividualMeter(individualMeter: IndividualMeters) {
        return this.individualMeterRepository.save(individualMeter);
    }

    async findIndividualMeterById(id: number) {
        return this.individualMeterRepository.findOne({ where: { id } });
    }

    async findIndividualMeterByFNumber(factoryNumber: string) {
        return this.individualMeterRepository.findOne({ where: { factoryNumber } });
    }
    async updateIndividualMeter(meter: IndividualMeters) {
        await this.individualMeterRepository.update(meter.id, meter);
        return this.findIndividualMeterById(meter.id);
    }
}
