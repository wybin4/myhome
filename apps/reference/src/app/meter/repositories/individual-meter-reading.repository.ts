import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IndividualMeterReadingEntity } from '../entities/individual-meter-reading.entity';
import { METER_NOT_EXIST, RMQException } from '@myhome/constants';

@Injectable()
export class IndividualMeterReadingRepository {
    constructor(
        @InjectRepository(IndividualMeterReadingEntity)
        private readonly individualMeterReadingRepository: Repository<IndividualMeterReadingEntity>,
    ) { }

    async create(individualMeterReading: IndividualMeterReadingEntity) {
        try {
            return await this.individualMeterReadingRepository.save(individualMeterReading);
        } catch (error) {
            if (error.code === 'ER_NO_REFERENCED_ROW_2') {
                throw new RMQException(
                    METER_NOT_EXIST.message(individualMeterReading.individualMeterId),
                    METER_NOT_EXIST.status
                );
            }
            throw error;
        }
    }

    async findById(id: number) {
        return await this.individualMeterReadingRepository.findOne({ where: { id } });
    }

}
