import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, Repository } from 'typeorm';
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

    async findReadingsByMeterIDsAndPeriods(
        meterIds: number[],
        startOfPreviousMonth: Date, endOfPreviousMonth: Date,
        startOfCurrentMonth: Date, endOfCurrentMonth: Date
    ) {
        const previousMonthReadings = await this.generalMeterReadingRepository.find({
            where: {
                generalMeterId: In(meterIds),
                readAt: Between(startOfPreviousMonth, endOfPreviousMonth),
            },
        });

        const currentMonthReadings = await this.generalMeterReadingRepository.find({
            where: {
                generalMeterId: In(meterIds),
                readAt: Between(startOfCurrentMonth, endOfCurrentMonth),
            },
        });

        return { previousMonthReadings, currentMonthReadings };
    }


}
