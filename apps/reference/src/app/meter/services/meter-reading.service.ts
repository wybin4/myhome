import { METER_READING_NOT_EXIST, INCORRECT_METER_TYPE, METER_NOT_EXIST, NORM_NOT_EXIST, APART_NOT_EXIST, RMQException, MISSING_PREVIOUS_READING, FAILED_TO_GET_METER_READINGS, FAILED_TO_GET_READINGS_WITHOUT_NORMS, NORMS_NOT_EXIST, HOME_NOT_EXIST, FAILED_TO_GET_PREVIOUS_READINGS, FAILED_TO_GET_CURRENT_READINGS } from "@myhome/constants";
import { IGeneralMeterReading, IGetMeterReading, IIndividualMeterReading, INorm, MeterStatus, MeterType, Reading } from "@myhome/interfaces";
import { HttpStatus, Injectable } from "@nestjs/common";
import { RMQError } from "nestjs-rmq";
import { ERROR_TYPE } from "nestjs-rmq/dist/constants";
import { ReferenceAddMeterReading, ReferenceGetMeterReadingBySID, ReferenceGetMeterReadingByHID } from "@myhome/contracts";
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
    public async getMeterReadingByHID({ houseId }: ReferenceGetMeterReadingByHID.Request) {
        const house = await this.houseRepository.findHouseById(houseId);
        if (!house) {
            throw new RMQError(HOME_NOT_EXIST, ERROR_TYPE.RMQ, HttpStatus.NOT_FOUND);
        }
        const temp = [];
        let reading: number;
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        const startOfPreviousMonth = new Date(currentYear, currentMonth - 1, 15);
        const endOfPreviousMonth = new Date(currentYear, currentMonth - 1, 25);

        const startOfCurrentMonth = new Date(currentYear, currentMonth, 15);
        const endOfCurrentMonth = new Date(currentYear, currentMonth, 25);

        const meters = await this.generalMeterRepository.findByHouseAndStatus(houseId, [MeterStatus.Active]);
        for (const meter of meters) {
            const tempReadings = await this.generalMeterReadingRepository.findReadingsByMeterIDAndPeriods(
                meter.id,
                startOfPreviousMonth,
                endOfPreviousMonth,
                startOfCurrentMonth,
                endOfCurrentMonth
            );
            if (!tempReadings.previousMonthReadings) {
                throw new RMQException(FAILED_TO_GET_PREVIOUS_READINGS.message(meter.id), FAILED_TO_GET_PREVIOUS_READINGS.status);
            }
            if (!tempReadings.currentMonthReadings) {
                throw new RMQException(FAILED_TO_GET_CURRENT_READINGS.message(meter.id), FAILED_TO_GET_CURRENT_READINGS.status);
            }
            reading = tempReadings.currentMonthReadings.reading - tempReadings.previousMonthReadings.reading;
            temp.push({
                meterReadings: { reading }, typeOfServiceId: meter.typeOfServiceId
            });
        }
        return { meterReadings: temp };
    }

    public async getMeterReadingBySID(
        dto: ReferenceGetMeterReadingBySID.Request
    ): Promise<ReferenceGetMeterReadingBySID.Response> {
        const apartment = await this.apartmentRepository.findApartmentById(dto.subscriber.apartmentId);
        if (!apartment) {
            throw new RMQError(APART_NOT_EXIST, ERROR_TYPE.RMQ, HttpStatus.NOT_FOUND);
        }
        const newMeterReading: IGetMeterReading[] = [];

        let norms: INorm[];
        try {
            norms = await this.normRepository.findByMCID(dto.managementCompanyId);
        } catch (e) {
            throw new RMQError(NORMS_NOT_EXIST.message, ERROR_TYPE.RMQ, HttpStatus.NOT_FOUND);
        }

        switch (dto.meterType) {
            case (MeterType.General):
                break;
            case (MeterType.Individual):
                try {
                    newMeterReading.push(
                        ...await this.getActiveMeterReadings(apartment.id, norms, apartment.numberOfRegistered)
                    );
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
                    throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
                }
                return { meterReadings: newMeterReading };
            default:
                throw new RMQError(INCORRECT_METER_TYPE, ERROR_TYPE.RMQ, HttpStatus.CONFLICT);
        }
    }


    private async getActiveMeterReadings(
        apartmentId: number, norms: INorm[], numberOfRegistered: number
    ): Promise<IGetMeterReading[]> {
        const temp = [];
        let reading: Reading;
        const activeMeters = await this.individualMeterRepository.findByApartmentAndStatus(apartmentId, [MeterStatus.Active]);
        for (const meter of activeMeters) {
            reading = await this.calculateActiveMeterReadings(meter.id, 15, 25, norms, numberOfRegistered, meter.typeOfServiceId);
            const tempReading =
                'difference' in reading ? reading.difference :
                    'norm' in reading ? reading.norm :
                        'avgVolume' in reading ? reading.avgVolume : 0;
            temp.push({
                meterReadings: {
                    individualMeterId: meter.id,
                    reading: tempReading,
                    readAt: new Date()
                },
                typeOfServiceId: meter.typeOfServiceId,
                fullMeterReadings: reading
            });
        }
        return temp;
    }

    private async calculateActiveMeterReadings(
        meterId: number,
        start: number, end: number,
        norms: INorm[],
        numberOfRegistered: number,
        typeOfServiceId: number
    ): Promise<Reading> {
        const currentDate = new Date();
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), start);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), end);

        const { currentMonthReadings, previousReadings } = await this.individualMeterReadingRepository.findReadingsByMeterIDAndPeriod(meterId, startOfMonth, endOfMonth);
        if (previousReadings.length <= 0) {
            // Если нет предыдущих показаний
            if (currentMonthReadings.length > 0) {
                // Если есть текущие, т.е. счётчик новый
                return {
                    current: currentMonthReadings[0].reading, previous: 0,
                    difference: currentMonthReadings[0].reading
                };
                // Если ничего нет
            } else throw new RMQException(FAILED_TO_GET_METER_READINGS.message(meterId), FAILED_TO_GET_METER_READINGS.status);
        }
        const lastReadingDate = previousReadings[0].readAt;
        const differenceInMonths = (currentDate.getMonth() - lastReadingDate.getMonth()) + 12 * (currentDate.getFullYear() - lastReadingDate.getFullYear());

        if (currentMonthReadings.length > 0) {
            // Если есть показания за текущий месяц
            if (differenceInMonths === 1) {
                // Если есть показания за предыдущий месяц
                return {
                    current: currentMonthReadings[0].reading, previous: previousReadings[0].reading,
                    difference: currentMonthReadings[0].reading - previousReadings[0].reading
                };
                // Есть показания за текущий, но нет за предыдущий
            } else throw new RMQException(MISSING_PREVIOUS_READING.message(meterId), MISSING_PREVIOUS_READING.status);
        } else {
            if (differenceInMonths < 3) {
                // Если прошло меньше трех месяцев с момента отправки показаний
                const averageConsumption = this.calculateAverageConsumption(previousReadings);
                return { avgVolume: averageConsumption };
            } else {
                const tempNorm = norms.filter(norm => norm.typeOfServiceId === typeOfServiceId);
                let norm: number;
                if (tempNorm.length > 0) {
                    norm = tempNorm[0].norm;
                } else throw new RMQException(NORM_NOT_EXIST.message, NORM_NOT_EXIST.status);
                return { norm: norm * numberOfRegistered };
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

    private async getNPAndNIMeterReadings(
        apartmentId: number,
        numberOfRegistered: number,
        norms: INorm[],
        meterStatus: MeterStatus[]
    ): Promise<IGetMeterReading[]> {
        try {
            const temp: IGetMeterReading[] = [];
            let norm: number, tempNorm: INorm[];
            const meters = await this.individualMeterRepository.findByApartmentAndStatus(apartmentId, meterStatus);
            for (const meter of meters) {
                tempNorm = norms.filter(norm => norm.typeOfServiceId === meter.typeOfServiceId);
                if (tempNorm.length > 0) {
                    norm = tempNorm[0].norm;
                } else throw new RMQException(NORM_NOT_EXIST.message, NORM_NOT_EXIST.status);
                temp.push({
                    meterReadings: {
                        individualMeterId: meter.id,
                        reading: norm * numberOfRegistered,
                        readAt: new Date()
                    }, typeOfServiceId: meter.typeOfServiceId,
                    fullMeterReadings: {
                        norm: norm * numberOfRegistered
                    }
                });
            }
            return temp;
        } catch (e) {
            throw new RMQException(FAILED_TO_GET_READINGS_WITHOUT_NORMS.message, FAILED_TO_GET_READINGS_WITHOUT_NORMS.status);
        }
    }
}