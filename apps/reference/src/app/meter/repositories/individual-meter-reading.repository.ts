import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IndividualMeterReadingEnitity } from '../entities/individual-meter-reading.entity';

@Injectable()
export class IndividualMeterReadingRepository {
    constructor(
        @InjectRepository(IndividualMeterReadingEnitity)
        private readonly individualMeterReadingRepository: Repository<IndividualMeterReadingEnitity>,
    ) { }

    async createIndividualMeterReading(individualMeterReading: IndividualMeterReadingEnitity) {
        return this.individualMeterReadingRepository.save(individualMeterReading);
    }

    async findIndividualMeterReadingById(id: number) {
        return this.individualMeterReadingRepository.findOne({ where: { id } });
    }

}
