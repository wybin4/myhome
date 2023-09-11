import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { GeneralMeterReadingEntity } from '../entities/general-meter-reading.entity';

@Injectable()
export class GeneralMeterReadingRepository {
    constructor(
        @InjectRepository(GeneralMeterReadingEntity)
        private readonly generalMeterReadingRepository: Repository<GeneralMeterReadingEntity>,
    ) { }

    async create(generalMeterReading: GeneralMeterReadingEntity) {
        return this.generalMeterReadingRepository.save(generalMeterReading);
    }

    async findById(id: number) {
        return this.generalMeterReadingRepository.findOne({ where: { id } });
    }

    async findReadingsByMeterIDAndPeriods(generalMeterId: number, startOfPreviousMonth: Date, endOfPreviousMonth: Date, startOfCurrentMonth: Date, endOfCurrentMonth: Date) {
        const previousMonthReadings = await this.generalMeterReadingRepository.findOne({
            where: {
                generalMeterId,
                readAt: Between(startOfPreviousMonth, endOfPreviousMonth),
            },
        });

        const currentMonthReadings = await this.generalMeterReadingRepository.findOne({
            where: {
                generalMeterId,
                readAt: Between(startOfCurrentMonth, endOfCurrentMonth),
            },
        });

        return { previousMonthReadings, currentMonthReadings };
    }


}
