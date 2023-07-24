import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GeneralMeterReadings } from '../entities/general-meter-reading.entity';

@Injectable()
export class GeneralMeterReadingRepository {
    constructor(
        @InjectRepository(GeneralMeterReadings)
        private readonly generalMeterReadingRepository: Repository<GeneralMeterReadings>,
    ) { }

    async createGeneralMeterReading(generalMeterReading: GeneralMeterReadings) {
        return this.generalMeterReadingRepository.save(generalMeterReading);
    }

    async findGeneralMeterReadingById(id: number) {
        return this.generalMeterReadingRepository.findOne({ where: { id } });
    }

}
