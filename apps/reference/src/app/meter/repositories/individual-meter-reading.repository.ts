import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, Repository } from 'typeorm';
import { IndividualMeterReadingEntity } from '../entities/individual-meter-reading.entity';

@Injectable()
export class IndividualMeterReadingRepository {
    constructor(
        @InjectRepository(IndividualMeterReadingEntity)
        private readonly individualMeterReadingRepository: Repository<IndividualMeterReadingEntity>,
    ) { }

    async create(individualMeterReading: IndividualMeterReadingEntity) {
        return this.individualMeterReadingRepository.save(individualMeterReading);
    }

    async findById(id: number) {
        return this.individualMeterReadingRepository.findOne({ where: { id } });
    }

    // показания за последние 7 месяцев
    async findReadingsByMeterIDsAndPeriod(meterIds: number[], startOfMonth: Date, endOfMonth: Date) {

        const currentMonthReadings = await this.individualMeterReadingRepository.find({
            where: {
                individualMeterId: In(meterIds),
                readAt: Between(startOfMonth, endOfMonth),
            },
        });
        const previousReadings = await this.individualMeterReadingRepository.find({
            where: {
                individualMeterId: In(meterIds),
                readAt: Between(new Date(0), startOfMonth), // Ищем показания до начала текущего месяца
            },
            order: { readAt: 'DESC' },
            take: 7,
        });
        return { currentMonthReadings, previousReadings };
    }

    // показания за последние 2 месяца
    async findReadingsByMeterIDsAndPeriods(
        meterIds: number[],
        startOfPreviousMonth: Date, endOfPreviousMonth: Date,
        startOfCurrentMonth: Date, endOfCurrentMonth: Date
    ) {
        const previousMonthReadings = await this.individualMeterReadingRepository.find({
            where: {
                individualMeterId: In(meterIds),
                readAt: Between(startOfPreviousMonth, endOfPreviousMonth),
            },
        });

        const currentMonthReadings = await this.individualMeterReadingRepository.find({
            where: {
                individualMeterId: In(meterIds),
                readAt: Between(startOfCurrentMonth, endOfCurrentMonth),
            },
        });

        return { previousMonthReadings, currentMonthReadings };
    }
}
