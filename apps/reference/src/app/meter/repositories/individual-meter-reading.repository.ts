import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IndividualMeterReadingEntity } from '../entities/individual-meter-reading.entity';

@Injectable()
export class IndividualMeterReadingRepository {
    constructor(
        @InjectRepository(IndividualMeterReadingEntity)
        private readonly individualMeterReadingRepository: Repository<IndividualMeterReadingEntity>,
    ) { }

    async createIndividualMeterReading(individualMeterReading: IndividualMeterReadingEntity) {
        return this.individualMeterReadingRepository.save(individualMeterReading);
    }

    async findIndividualMeterReadingById(id: number) {
        return this.individualMeterReadingRepository.findOne({ where: { id } });
    }

    async findLastTwoReadingByMeterID(individualMeterId: number) {
        return this.individualMeterReadingRepository.find({
            where: { individualMeterId },
            order: { readAt: 'DESC' },
            take: 2,
        });
    }
}
