import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GeneralMeterReadingEntity } from '../entities/general-meter-reading.entity';

@Injectable()
export class GeneralMeterReadingRepository {
    constructor(
        @InjectRepository(GeneralMeterReadingEntity)
        private readonly generalMeterReadingRepository: Repository<GeneralMeterReadingEntity>,
    ) { }

    async createGeneralMeterReading(generalMeterReading: GeneralMeterReadingEntity) {
        return this.generalMeterReadingRepository.save(generalMeterReading);
    }

    async findGeneralMeterReadingById(id: number) {
        return this.generalMeterReadingRepository.findOne({ where: { id } });
    }

    async findLastTwoReadingByMeterID(generalMeterId: number) {
        return this.generalMeterReadingRepository.find({
            where: { generalMeterId },
            order: { readAt: 'DESC' },
            take: 2,
        });
    }
}
