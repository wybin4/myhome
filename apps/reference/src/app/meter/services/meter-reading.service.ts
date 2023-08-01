import { METER_READING_NOT_EXIST, INCORRECT_METER_TYPE, METER_NOT_EXIST, NORM_NOT_EXIST, APART_NOT_EXIST } from "@myhome/constants";
import { IGeneralMeterReading, IHouse, IIndividualMeterReading, INorm, MeterStatus, MeterType } from "@myhome/interfaces";
import { HttpStatus, Injectable, NotFoundException, UnprocessableEntityException } from "@nestjs/common";
import { RMQError } from "nestjs-rmq";
import { ERROR_TYPE } from "nestjs-rmq/dist/constants";
import { IGetMeterReadingBySID, ReferenceAddMeterReading, ReferenceGetMeterReadingBySID } from "@myhome/contracts";
import { GeneralMeterReadingEntity } from "../entities/general-meter-reading.entity";
import { IndividualMeterReadingEntity } from "../entities/individual-meter-reading.entity";
import { GeneralMeterReadingRepository } from "../repositories/general-meter-reading.repository";
import { IndividualMeterReadingRepository } from "../repositories/individual-meter-reading.repository";
import { IndividualMeterRepository } from "../repositories/individual-meter.repository";
import { GeneralMeterRepository } from "../repositories/general-meter.repository";
import { Meters } from "./meter.service";
import { ApartmentRepository } from "../../subscriber/repositories/apartment.repository";
import { HouseRepository } from "../../subscriber/repositories/house.repository";
import { NormRepository } from "../../tariff-and-norm/base-tariff-and-norm.repository";

type MeterReadings = IndividualMeterReadingEntity | GeneralMeterReadingEntity;

@Injectable()
export class MeterReadingService {
    constructor(
        private readonly individualMeterReadingRepository: IndividualMeterReadingRepository,
        private readonly generalMeterReadingRepository: GeneralMeterReadingRepository,
        private readonly individualMeterRepository: IndividualMeterRepository,
        private readonly generalMeterRepository: GeneralMeterRepository,
        private readonly apartmentRepository: ApartmentRepository,
        private readonly houseRepository: HouseRepository,
        private readonly normRepository: NormRepository
    ) { }

    public async getMeterReading(id: number, meterType: MeterType) {
        let meterReading: GeneralMeterReadingEntity | IndividualMeterReadingEntity;
        let gettedMeterReading: Omit<IGeneralMeterReading | IIndividualMeterReading, 'id'>;
        switch (meterType) {
            case (MeterType.General):
                meterReading = await this.generalMeterReadingRepository.findGeneralMeterReadingById(id);
                if (!meterReading) {
                    throw new RMQError(METER_READING_NOT_EXIST, ERROR_TYPE.RMQ, HttpStatus.NOT_FOUND);
                }
                gettedMeterReading = new GeneralMeterReadingEntity(meterReading).getGeneralMeterReading();
                return { gettedMeterReading };
            case (MeterType.Individual):
                meterReading = await this.individualMeterReadingRepository.findIndividualMeterReadingById(id);
                if (!meterReading) {
                    throw new RMQError(METER_READING_NOT_EXIST, ERROR_TYPE.RMQ, HttpStatus.NOT_FOUND);
                }
                gettedMeterReading = new IndividualMeterReadingEntity(meterReading).getIndividualMeterReading();
                return { gettedMeterReading };
            default:
                throw new RMQError(INCORRECT_METER_TYPE, ERROR_TYPE.RMQ, HttpStatus.CONFLICT);
        }

    }

    public async addMeterReading(dto: ReferenceAddMeterReading.Request) {
        let meter: Meters;
        let newMeterReading: MeterReadings,
            newMeterReadingEntity: MeterReadings;
        switch (dto.meterType) {
            case (MeterType.General):
                meter = await this.generalMeterRepository.findGeneralMeterById(dto.meterId);
                if (!meter) {
                    throw new RMQError(METER_NOT_EXIST, ERROR_TYPE.RMQ, HttpStatus.NOT_FOUND);
                }
                newMeterReadingEntity = new GeneralMeterReadingEntity({
                    generalMeterId: dto.meterId,
                    reading: dto.reading,
                    readAt: new Date(dto.readAt),
                });
                newMeterReading = await this.generalMeterReadingRepository.createGeneralMeterReading(newMeterReadingEntity);
                return { newMeterReading };
            case (MeterType.Individual):
                meter = await this.individualMeterRepository.findIndividualMeterById(dto.meterId);
                if (!meter) {
                    throw new RMQError(METER_NOT_EXIST, ERROR_TYPE.RMQ, HttpStatus.NOT_FOUND);
                }
                newMeterReadingEntity = new IndividualMeterReadingEntity({
                    individualMeterId: dto.meterId,
                    reading: dto.reading,
                    readAt: new Date(dto.readAt),
                });
                newMeterReading = await this.individualMeterReadingRepository.createIndividualMeterReading(newMeterReadingEntity);
                return { newMeterReading };
            default:
                throw new RMQError(INCORRECT_METER_TYPE, ERROR_TYPE.RMQ, HttpStatus.CONFLICT);
        }
    }
    public async getMeterReadingBySID(dto: ReferenceGetMeterReadingBySID.Request)/*: Promise<ReferenceGetMeterReadingBySID.Response>*/ {
        const apartment = await this.apartmentRepository.findApartmentById(dto.subscriber.apartmentId);
        if (!apartment) {
            throw new RMQError(APART_NOT_EXIST, ERROR_TYPE.RMQ, HttpStatus.NOT_FOUND);
        }
        const newMeterReading: IGetMeterReadingBySID[] = [];
        let activeReadings: IIndividualMeterReading;
        let house: IHouse;
        let norms: INorm[];
        try {
            norms = await this.normRepository.findByMCID(dto.managementCompanyId);
        } catch (e) {
            throw new RMQError(NORM_NOT_EXIST, ERROR_TYPE.RMQ, HttpStatus.NOT_FOUND);
        }
        switch (dto.meterType) {
            case (MeterType.General):
                break;
            // house = await this.houseRepository.findHouseById(apartment.houseId);
            // activeMeters = await this.generalMeterRepository.findActiveGeneralMetersByHouse(house.id);
            // for (const meter of activeMeters) {
            //     const readings = await this.generalMeterReadingRepository.findLastTwoReadingByMeterID(meter.id);
            //     newMeterReading.push({ meterReadings:  ...readings , typeOfSeriveId: meter.typeOfServiceId });
            // }
            // return { meterReadings: newMeterReading };
            case (MeterType.Individual):
                try {
                    newMeterReading.push(...await this.getActiveMeterReadings(apartment.id, norms, apartment.numberOfRegistered));
                    newMeterReading.push(
                        ...await this.getNPAndNIMeterReadings
                            (
                                apartment.id,
                                apartment.numberOfRegistered,
                                norms,
                                [MeterStatus.NoPossibility, MeterStatus.NotInstall]
                            )
                    )
                }
                catch (e) {
                    throw new RMQError(e.messages, ERROR_TYPE.RMQ, e.code);
                }
                return { meterReadings: newMeterReading };
            default:
                throw new RMQError(INCORRECT_METER_TYPE, ERROR_TYPE.RMQ, HttpStatus.CONFLICT);
        }
    }

    private async getActiveMeterReadings(apartmentId: number, norms: INorm[], numberOfRegistered: number) {
        const temp = [];
        let reading: Promise<IndividualMeterReadingEntity[] | {
            reading: number;
            readAt: Date;
            individualMeterId: number;
        }>;
        const activeMeters = await this.individualMeterRepository.findByApartmentAndStatus(apartmentId, [MeterStatus.Active]);
        for (const meter of activeMeters) {
            try {
                reading = this.calculateActiveMeterReadings(meter.id, 15, 25, norms, numberOfRegistered, meter.typeOfServiceId);
            } catch (e) {
                throw new Error(e.messages);
            }
            temp.push({
                meterReadings: { reading }, typeOfSeriveId: meter.typeOfServiceId
            });
        }
        return temp;
    }

    private async calculateActiveMeterReadings(meterId: number, start: number, end: number, norms: INorm[], numberOfRegistered: number, typeOfSeriveId: number) {
        const currentDate = new Date();
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), start);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), end);

        const { currentMonthReadings, previousReadings } = await this.individualMeterReadingRepository.findReadingsByMeterIDAndPeriod(meterId, startOfMonth, endOfMonth);
        if (previousReadings.length <= 0) {
            // Если нет предыдущих показаний
            if (currentMonthReadings.length > 0) {
                // Если есть текущие, т.е. счётчик новый
                return currentMonthReadings;
            } else throw new NotFoundException('Для счётчика с id ' + meterId + ' нет показаний');
            // Если ничего нет
        }
        const lastReadingDate = previousReadings[0].readAt;
        const differenceInMonths = (currentDate.getMonth() - lastReadingDate.getMonth()) + 12 * (currentDate.getFullYear() - lastReadingDate.getFullYear());

        if (currentMonthReadings.length > 0) {
            // Если есть показания за текущий месяц
            if (differenceInMonths === 1) {
                // Если есть показания за предыдущий месяц
                return {
                    reading: currentMonthReadings[0].reading - previousReadings[0].reading,
                    readAt: currentMonthReadings[0].readAt,
                    individualMeterId: currentMonthReadings[0].individualMeterId
                };
                // Есть показания за текущий, но нет за предыдущий
            } else throw new UnprocessableEntityException(
                'Для счётчика с id ' + meterId + ' есть показания за текущий, но нет за предыдущий период'
            );
        } else {
            if (differenceInMonths < 3) {
                // Если прошло меньше трех месяцев с момента отправки показаний
                const averageConsumption = this.calculateAverageConsumption(previousReadings);
                return {
                    reading: averageConsumption,
                    individualMeterId: previousReadings[0].individualMeterId,
                    readAt: currentDate,
                };
            } else {
                const tempNorm = norms.filter(norm => norm.typeOfServiceId === typeOfSeriveId);
                let norm: number;
                if (tempNorm.length > 0) {
                    norm = tempNorm[0].norm;
                } else throw new NotFoundException(NORM_NOT_EXIST);
                return {
                    reading: norm * numberOfRegistered,
                    readAt: new Date(),
                    individualMeterId: meterId
                }
                // Расчёт по нормативу
            }
        }
    }
    private calculateAverageConsumption(readings: IndividualMeterReadingEntity[]): number {
        const volume = [];

        for (let i = readings.length - 1; i > 0; i--) {
            const consumption = readings[i - 1].reading - readings[i].reading;
            volume.push(consumption);
        }
        const averageConsumption = volume.reduce((sum, value) => sum + value, 0) / volume.length;
        return averageConsumption;
    }

    private async getNPAndNIMeterReadings(apartmentId: number, numberOfRegistered: number, norms: INorm[], meterStatus: MeterStatus[]) {
        const temp = [];
        let norm: number, tempNorm: INorm[];
        const meters = await this.individualMeterRepository.findByApartmentAndStatus(apartmentId, meterStatus);
        for (const meter of meters) {
            tempNorm = norms.filter(norm => norm.typeOfServiceId === meter.typeOfServiceId);
            if (tempNorm.length > 0) {
                norm = tempNorm[0].norm;
            } else throw new NotFoundException(NORM_NOT_EXIST);
            temp.push({
                meterReadings: {
                    individualMeterId: meter.id,
                    reading: norm * numberOfRegistered,
                    readAt: new Date(),
                }, typeOfSeriveId: meter.typeOfServiceId
            });
        }
        return temp;
    }
}