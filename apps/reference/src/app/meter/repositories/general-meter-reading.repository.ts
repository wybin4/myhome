import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GeneralMeterReadingEnitity } from '../entities/general-meter-reading.entity';

@Injectable()
export class GeneralMeterReadingRepository {
    constructor(
        @InjectRepository(GeneralMeterReadingEnitity)
        private readonly generalMeterReadingRepository: Repository<GeneralMeterReadingEnitity>,
    ) { }

    async createGeneralMeterReading(generalMeterReading: GeneralMeterReadingEnitity) {
        return this.generalMeterReadingRepository.save(generalMeterReading);
    }

    async findGeneralMeterReadingById(id: number) {
        return this.generalMeterReadingRepository.findOne({ where: { id } });
    }

}
