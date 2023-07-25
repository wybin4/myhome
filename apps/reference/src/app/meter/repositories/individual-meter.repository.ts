import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Not, Repository } from 'typeorm';
import { IndividualMeterEnitity } from '../entities/individual-meter.entity';
import { MeterStatus } from '@myhome/interfaces';

@Injectable()
export class IndividualMeterRepository {
    constructor(
        @InjectRepository(IndividualMeterEnitity)
        private readonly individualMeterRepository: Repository<IndividualMeterEnitity>,
    ) { }

    async createIndividualMeter(individualMeter: IndividualMeterEnitity) {
        return this.individualMeterRepository.save(individualMeter);
    }

    async findIndividualMeterById(id: number) {
        return this.individualMeterRepository.findOne({ where: { id } });
    }

    async findIndividualMeterByFNumber(factoryNumber: string) {
        return this.individualMeterRepository.findOne({ where: { factoryNumber } });
    }
    async updateIndividualMeter(meter: IndividualMeterEnitity) {
        await this.individualMeterRepository.update(meter.id, meter);
        return this.findIndividualMeterById(meter.id);
    }
    async findExpiredIndividualMeters(): Promise<IndividualMeterEnitity[]> {
        const currentDate = new Date();
        return this.individualMeterRepository.find({
            where: {
                verifiedAt: LessThan(currentDate),
                status: Not(MeterStatus.Archieve),
            },
        });
    }
    async saveIndividualMeters(meters: IndividualMeterEnitity[]): Promise<IndividualMeterEnitity[]> {
        return this.individualMeterRepository.save(meters);
    }
}
