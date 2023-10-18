import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, LessThan, Not, Repository } from 'typeorm';
import { IndividualMeterEntity } from '../entities/individual-meter.entity';
import { MeterStatus } from '@myhome/interfaces';
import { RMQException, UNPROCESSABLE_METER } from '@myhome/constants';

@Injectable()
export class IndividualMeterRepository {
    constructor(
        @InjectRepository(IndividualMeterEntity)
        private readonly individualMeterRepository: Repository<IndividualMeterEntity>,
    ) { }

    async create(individualMeter: IndividualMeterEntity) {
        try {
            return await this.individualMeterRepository.save(individualMeter);
        } catch (error) {
            if (error.code === 'ER_NO_REFERENCED_ROW_2') {
                throw new RMQException(UNPROCESSABLE_METER.message, UNPROCESSABLE_METER.status);
            }
            throw error;
        }
    }

    async findById(id: number) {
        return await this.individualMeterRepository.findOne({ where: { id } });
    }

    async findByFNumber(factoryNumber: string) {
        return await this.individualMeterRepository.findOne({ where: { factoryNumber } });
    }

    async update(meter: IndividualMeterEntity) {
        await this.individualMeterRepository.update(meter.id, meter);
        return await this.findById(meter.id);
    }
    async findExpiredIndividualMeters(): Promise<IndividualMeterEntity[]> {
        const currentDate = new Date();
        return await this.individualMeterRepository.find({
            where: {
                verifiedAt: LessThan(currentDate),
                status: Not(MeterStatus.Archieve),
            },
        });
    }
    async findByApartments(apartmentIds: number[]): Promise<IndividualMeterEntity[]> {
        return await this.individualMeterRepository.find({
            where: {
                apartmentId: In(apartmentIds)
            },
        });
    }

    async save(meters: IndividualMeterEntity[]): Promise<IndividualMeterEntity[]> {
        return await this.individualMeterRepository.save(meters);
    }

    async findActiveIndividualMetersByAID(apartmentId: number): Promise<IndividualMeterEntity[]> {
        return await this.individualMeterRepository.find({
            where: {
                apartmentId,
                status: MeterStatus.Active,
            },
        });
    }

    // просто показания за последние месяцы
    async findReadingsByAIdsAndPeriod(
        apartmentIds: number[],
        endOfPreviousMonth: Date,
        startOfCurrentMonth: Date,
        endOfCurrentMonth: Date
    ) {
        const individualMeters = await this.individualMeterRepository
            .createQueryBuilder('individualMeter')
            .leftJoinAndSelect('individualMeter.individualMeterReadings', 'individualMeterReadings')
            .where('individualMeter.apartmentId IN (:...apartmentIds)', { apartmentIds })
            .getMany();

        const currentMonthReadings = individualMeters.map((meter) => {
            if (meter.individualMeterReadings && meter.individualMeterReadings.length > 0) {
                return meter.individualMeterReadings.find((reading) =>
                    reading.readAt >= startOfCurrentMonth && reading.readAt <= endOfCurrentMonth
                );
            } else {
                return undefined;
            }
        });

        // предыдущее показание могло быть за любой месяц
        const previousMonthReadings = individualMeters.map((meter) => {
            if (meter.individualMeterReadings && meter.individualMeterReadings.length > 0) {
                return meter.individualMeterReadings.find((reading) =>
                    reading.readAt <= endOfPreviousMonth
                );
            } else {
                return undefined;
            }
        });

        const result = individualMeters.map((meter) => {
            const current = currentMonthReadings.find((currentReading) =>
                currentReading ? currentReading.individualMeterId === meter.id : undefined
            );
            const previous = previousMonthReadings.find((previousReading) =>
                previousReading ? previousReading.individualMeterId === meter.id : undefined
            );

            return {
                meter: meter.get(),
                reading: {
                    current: current ? current : undefined,
                    previous: previous ? previous : undefined,
                }
            };
        });

        return result;
    }

    // показания за последние 7 месяцев
    async findActiveReadingsByAIdsAndPeriod(apartmentIds: number[], startOfMonth: Date, endOfMonth: Date) {
        const individualMeters = await this.individualMeterRepository.createQueryBuilder('individualMeter')
            .innerJoinAndSelect('individualMeter.individualMeterReadings', 'individualMeterReadings')
            .where('individualMeter.apartmentId IN (:...apartmentIds)', { apartmentIds })
            .andWhere('individualMeter.status = :status', { status: MeterStatus.Active })
            .orderBy('individualMeterReadings.readAt', 'DESC')
            .getMany();

        const readings = individualMeters.map(meter => ({
            meterId: meter.id,
            meterStatus: meter.status,
            apartmentId: meter.apartmentId,
            typeOfServiceId: meter.typeOfServiceId,
            reading: meter.individualMeterReadings ? {
                current: meter.individualMeterReadings.filter(reading =>
                    reading.readAt >= startOfMonth && reading.readAt <= endOfMonth
                ),
                previous: meter.individualMeterReadings.filter(reading =>
                    reading.readAt < startOfMonth
                ).slice(0, 7)
            } :
                {
                    current: [],
                    previous: [],
                },
        }));

        return readings;
    }

    async findNIAndNPReadingsByHId(
        apartmentIds: number[]
    ) {
        const individualMeters = await this.individualMeterRepository
            .createQueryBuilder('individualMeter')
            .where('individualMeter.apartmentId IN (:...apartmentIds)', { apartmentIds })
            .andWhere('individualMeter.status in (:...status)', {
                status: [MeterStatus.NoPossibility, MeterStatus.NotInstall]
            })
            .getMany();

        const result = individualMeters.map((meter) => {
            return {
                meterId: meter.id,
                apartmentId: meter.apartmentId,
                meterStatus: meter.status,
                typeOfServiceId: meter.typeOfServiceId,
                reading: {
                    current: [],
                    previous: [],
                },
            };
        });

        return result;
    }

}
