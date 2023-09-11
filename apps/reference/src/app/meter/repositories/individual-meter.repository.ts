import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, LessThan, Not, Repository } from 'typeorm';
import { IndividualMeterEntity } from '../entities/individual-meter.entity';
import { MeterStatus } from '@myhome/interfaces';

@Injectable()
export class IndividualMeterRepository {
    constructor(
        @InjectRepository(IndividualMeterEntity)
        private readonly individualMeterRepository: Repository<IndividualMeterEntity>,
    ) { }

    async create(individualMeter: IndividualMeterEntity) {
        return this.individualMeterRepository.save(individualMeter);
    }

    async findById(id: number) {
        return this.individualMeterRepository.findOne({ where: { id } });
    }

    async findByFNumber(factoryNumber: string) {
        return this.individualMeterRepository.findOne({ where: { factoryNumber } });
    }
    async update(meter: IndividualMeterEntity) {
        await this.individualMeterRepository.update(meter.id, meter);
        return this.findById(meter.id);
    }
    async findExpiredIndividualMeters(): Promise<IndividualMeterEntity[]> {
        const currentDate = new Date();
        return this.individualMeterRepository.find({
            where: {
                verifiedAt: LessThan(currentDate),
                status: Not(MeterStatus.Archieve),
            },
        });
    }
    async findByApartmentAndStatus(apartmentId: number, status: MeterStatus[]): Promise<IndividualMeterEntity[]> {
        return this.individualMeterRepository.find({
            where: {
                apartmentId,
                status: In(status),
            },
        });
    }

    async save(meters: IndividualMeterEntity[]): Promise<IndividualMeterEntity[]> {
        return this.individualMeterRepository.save(meters);
    }
}
