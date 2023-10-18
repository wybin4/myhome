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

    async create(generalMeterReading: GeneralMeterReadingEntity) {
        return await this.generalMeterReadingRepository.save(generalMeterReading);
    }

    async findById(id: number) {
        return await this.generalMeterReadingRepository.findOne({ where: { id } });
    }

}
