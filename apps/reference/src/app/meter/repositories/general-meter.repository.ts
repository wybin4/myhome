import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, LessThan, Not, Repository } from 'typeorm';
import { GeneralMeterEntity } from '../entities/general-meter.entity';
import { IMeta, MeterStatus } from '@myhome/interfaces';
import { RMQException, UNPROCESSABLE_METER, applyMeta } from '@myhome/constants';

@Injectable()
export class GeneralMeterRepository {
    constructor(
        @InjectRepository(GeneralMeterEntity)
        private readonly generalMeterRepository: Repository<GeneralMeterEntity>,
    ) { }

    async create(generalMeter: GeneralMeterEntity) {
        try {
            return await this.generalMeterRepository.save(generalMeter);
        } catch (error) {
            if (error.code === 'ER_NO_REFERENCED_ROW_2') {
                throw new RMQException(UNPROCESSABLE_METER.message, UNPROCESSABLE_METER.status);
            }
            throw error;
        }
    }

    async createMany(generalMeters: GeneralMeterEntity[]) {
        return await this.generalMeterRepository.save(generalMeters);
    }

    async findById(id: number) {
        return await this.generalMeterRepository.findOne({ where: { id } });
    }

    async findByIdsWithTOS(ids: number[]) {
        return await this.generalMeterRepository.createQueryBuilder('generalMeter')
            .innerJoinAndSelect('generalMeter.typeOfService', 'typeOfService')
            .where('generalMeter.id in (:...ids)', { ids })
            .getMany();
    }

    async findByFNumbers(factoryNumbers: string[]) {
        return await this.generalMeterRepository.find({ where: { factoryNumber: In(factoryNumbers) } });
    }

    async update(meter: GeneralMeterEntity) {
        await this.generalMeterRepository.update(meter.id, meter);
        return await this.findById(meter.id);
    }

    async findExpiredGeneralMeters(): Promise<GeneralMeterEntity[]> {
        const currentDate = new Date();
        return await this.generalMeterRepository.find({
            where: {
                verifiedAt: LessThan(currentDate),
                status: Not(MeterStatus.Archieve),
            },
        });
    }

    async findActiveGeneralMetersByHouse(houseId: number): Promise<GeneralMeterEntity[]> {
        return await this.generalMeterRepository.find({
            where: {
                status: MeterStatus.Active,
                houseId: houseId
            },
        });
    }

    async saveMany(meters: GeneralMeterEntity[]): Promise<GeneralMeterEntity[]> {
        return await this.generalMeterRepository.save(meters);
    }

    async findActiveReadingsByHIdAndPeriod(
        houseId: number,
        startOfPreviousMonth: Date,
        endOfPreviousMonth: Date,
        startOfCurrentMonth: Date,
        endOfCurrentMonth: Date
    ) {
        const generalMeters = await this.generalMeterRepository
            .createQueryBuilder('generalMeter')
            .innerJoinAndSelect('generalMeter.generalMeterReadings', 'generalMeterReadings')
            .where('generalMeter.houseId = :houseId', { houseId })
            .andWhere('generalMeter.status = :status', { status: MeterStatus.Active })
            .getMany();

        const currentMonthGeneralMeterReadings = generalMeters.map((meter) => {
            return {
                generalMeterId: meter.id,
                reading: meter.generalMeterReadings.find((reading) => {
                    return reading.readAt >= startOfCurrentMonth && reading.readAt <= endOfCurrentMonth;
                }),
            };
        });

        const previousMonthGeneralMeterReadings = generalMeters.map((meter) => {
            return {
                generalMeterId: meter.id,
                reading: meter.generalMeterReadings.find((reading) => {
                    return reading.readAt >= startOfPreviousMonth && reading.readAt <= endOfPreviousMonth;
                }),
            };
        });

        const result = generalMeters.map((meter) => {
            const current = currentMonthGeneralMeterReadings.find((currentReading) =>
                currentReading.generalMeterId === meter.id
            );
            const previous = previousMonthGeneralMeterReadings.find((previousReading) =>
                previousReading.generalMeterId === meter.id
            );

            return {
                meterId: meter.id,
                typeOfServiceId: meter.typeOfServiceId,
                reading: {
                    current: current ? current.reading : null,
                    previous: previous ? previous.reading : null,
                }
            };
        });

        return result;
    }

    async findReadingsByHIdsAndPeriod(
        houseIds: number[],
        meta: IMeta
    ) {
        let queryBuilder = this.generalMeterRepository.createQueryBuilder('generalMeter');
        queryBuilder.leftJoinAndSelect('generalMeter.generalMeterReadings', 'generalMeterReadings')
            .where('generalMeter.houseId in (:...houseIds)', { houseIds });
        const { queryBuilder: newQueryBuilder, totalCount } = await applyMeta<GeneralMeterEntity>(queryBuilder, meta);
        queryBuilder = newQueryBuilder;

        const generalMeters = await queryBuilder.getMany();

        const result = generalMeters.map((meter) => {
            const readings = meter.generalMeterReadings.slice(0, 2);

            return {
                meter: meter.get(),
                reading: {
                    current: readings.length ? readings[0] : undefined,
                    previous: readings.length > 1 ? readings[1] : undefined,
                }
            };
        });

        return { meters: result, totalCount };
    }

    async findNIAndNPReadingsByHId(
        houseId: number
    ) {
        const generalMeters = await this.generalMeterRepository
            .createQueryBuilder('generalMeter')
            .where('generalMeter.houseId = :houseId', { houseId })
            .andWhere('generalMeter.status IN (:...status)', {
                status: [MeterStatus.NoPossibility, MeterStatus.NotInstall]
            })
            .getMany();

        const result = generalMeters.map((meter) => {
            return {
                meterId: meter.id,
                typeOfServiceId: meter.typeOfServiceId,
                reading: {
                    current: null,
                    previous: null,
                },
            };
        });

        return result;
    }

    async findManyByHouses(houseIds: number[], meta: IMeta) {
        let queryBuilder = this.generalMeterRepository.createQueryBuilder('generalMeter');
        queryBuilder.leftJoinAndSelect('generalMeter.generalMeterReadings', 'generalMeterReadings')
            .where('generalMeter.houseId in (:...houseIds)', { houseIds });
        const { queryBuilder: newQueryBuilder, totalCount } = await applyMeta<GeneralMeterEntity>(queryBuilder, meta);
        queryBuilder = newQueryBuilder;
        return { meters: await queryBuilder.getMany(), totalCount };
    }
}
