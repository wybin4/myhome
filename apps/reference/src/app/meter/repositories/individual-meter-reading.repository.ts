import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
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
    async findReadingsByMeterIDAndPeriod(individualMeterId: number, startOfMonth: Date, endOfMonth: Date) {

        const currentMonthReadings = await this.individualMeterReadingRepository.find({
            where: {
                individualMeterId,
                readAt: Between(startOfMonth, endOfMonth),
            },
        });
        const previousReadings = await this.individualMeterReadingRepository.find({
            where: {
                individualMeterId,
                readAt: Between(new Date(0), startOfMonth), // Ищем показания до начала текущего месяца
            },
            order: { readAt: 'DESC' },
            take: 7,
        });
        return { currentMonthReadings, previousReadings };
    }
}
