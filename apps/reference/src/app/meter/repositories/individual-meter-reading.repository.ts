import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IndividualMeterReadings } from '../entities/individual-meter-reading.entity';

@Injectable()
export class IndividualMeterReadingRepository {
    constructor(
        @InjectRepository(IndividualMeterReadings)
        private readonly individualMeterReadingRepository: Repository<IndividualMeterReadings>,
    ) { }

    async createIndividualMeterReading(individualMeterReading: IndividualMeterReadings) {
        return this.individualMeterReadingRepository.save(individualMeterReading);
    }

    async findIndividualMeterReadingById(id: number) {
        return this.individualMeterReadingRepository.findOne({ where: { id } });
    }

}
