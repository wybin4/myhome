import { METER_READING_NOT_EXIST, INCORRECT_METER_TYPE, METER_NOT_EXIST, NORM_NOT_EXIST, RMQException, MISSING_PREVIOUS_READING, FAILED_TO_GET_METER_READINGS, FAILED_TO_GET_READINGS_WITHOUT_NORMS, NORMS_NOT_EXIST, HOUSE_NOT_EXIST, FAILED_TO_GET_CURRENT_READINGS, APARTS_NOT_EXIST, getGenericObject, addGenericObject, METERS_NOT_EXIST, SUBSCRIBERS_NOT_EXIST } from "@myhome/constants";
import { IGeneralMeterReading, IGetMeterReading, IGetMeterReadings, IIndividualMeterReading, INorm, MeterStatus, MeterType, Reading, TypeOfNorm } from "@myhome/interfaces";
import { HttpStatus, Injectable } from "@nestjs/common";
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
import { SubscriberRepository } from "../../subscriber/repositories/subscriber.repository";

export interface IApartmentAndSubscriber {
    subscriberId: number;
    apartmentId: number;
    numberOfRegistered: number;
}

type ApartmentAndMeterReadings = {
    apartmentId: number,
    subscriberId: number,
    numberOfRegistered: number,
    meters: IndividualMeterWithReadings[]
} | {
    apartmentId: number,
    subscriberId: number,
    numberOfRegistered: number,
    meters: []
};

type IndividualMeterWithReadings = {
    meterId: number,
    meterStatus: MeterStatus,
    typeOfServiceId: number,
    reading: IndividualCurrentAndPrevReadings
};

type GeneralMeterWithReadings = {
    meterId: number,
    typeOfServiceId: number,
    reading: GeneralCurrentAndPrevReadings,
    meterStatus: MeterStatus
};

type IndividualCurrentAndPrevReadings = {
    current: IIndividualMeterReading[]; previous: IIndividualMeterReading[]
};

type GeneralCurrentAndPrevReadings = {
    current: IGeneralMeterReading; previous: IGeneralMeterReading;
};

@Injectable()
export class MeterReadingService {
    constructor(
        private readonly individualMeterReadingRepository: IndividualMeterReadingRepository,
        private readonly generalMeterReadingRepository: GeneralMeterReadingRepository,
        private readonly individualMeterRepository: IndividualMeterRepository,
        private readonly generalMeterRepository: GeneralMeterRepository,
        private readonly apartmentRepository: ApartmentRepository,
        private readonly subscriberRepository: SubscriberRepository,
        private readonly houseRepository: HouseRepository,
        private readonly normRepository: NormRepository
    ) { }

    public async getMeterReading(id: number, meterType: MeterType) {
        switch (meterType) {
            case (MeterType.General):
                return {
                    meterReading: await getGenericObject<GeneralMeterReadingEntity>
                        (
                            this.generalMeterReadingRepository,
                            (item) => new GeneralMeterReadingEntity(item),
                            id,
                            METER_READING_NOT_EXIST
                        )
                };
            case (MeterType.Individual):
                return {
                    meterReading: await getGenericObject<IndividualMeterReadingEntity>
                        (
                            this.individualMeterReadingRepository,
                            (item) => new IndividualMeterReadingEntity(item),
                            id,
                            METER_READING_NOT_EXIST
                        )
                };
            default:
                throw new RMQException(INCORRECT_METER_TYPE, HttpStatus.CONFLICT);
        }

    }

    public async addMeterReading(dto: ReferenceAddMeterReading.Request) {
        let meter: Meters;
        switch (dto.meterType) {
            case (MeterType.General):
                meter = await this.generalMeterRepository.findById(dto.meterId);
                if (!meter) {
                    throw new RMQException(METER_NOT_EXIST.message(dto.meterId), METER_NOT_EXIST.status);
                }
                return await addGenericObject<GeneralMeterReadingEntity>
                    (
                        this.generalMeterReadingRepository,
                        (item) => new GeneralMeterReadingEntity(item),
                        {
                            generalMeterId: dto.meterId,
                            reading: dto.reading,
                            readAt: new Date(dto.readAt)
                        } as IGeneralMeterReading
                    );
            case (MeterType.Individual):
                meter = await this.individualMeterRepository.findById(dto.meterId);
                if (!meter) {
                    throw new RMQException(METER_NOT_EXIST.message(dto.meterId), METER_NOT_EXIST.status);
                }
                return await addGenericObject<IndividualMeterReadingEntity>
                    (
                        this.individualMeterReadingRepository,
                        (item) => new IndividualMeterReadingEntity(item),
                        {
                            individualMeterId: dto.meterId,
                            reading: dto.reading,
                            readAt: new Date(dto.readAt)
                        } as IndividualMeterReadingEntity
                    );
            default:
                throw new RMQException(INCORRECT_METER_TYPE, HttpStatus.CONFLICT);
        }
    }

    private async getMeterReadingsByHouseIdFromDB(houseId: number, start: number, end: number)
        : Promise<GeneralMeterWithReadings[]> {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        const startOfPreviousMonth = new Date(currentYear, currentMonth - 1, start);
        const endOfPreviousMonth = new Date(currentYear, currentMonth - 1, end);

        const startOfCurrentMonth = new Date(currentYear, currentMonth, start);
        const endOfCurrentMonth = new Date(currentYear, currentMonth, end);

        const meters = await this.generalMeterRepository.findByHouseAndStatus(houseId, [MeterStatus.Active]);
        const meterIds = meters.map(obj => obj.id);
        const { currentMonthReadings, previousMonthReadings } = await this.generalMeterReadingRepository.
            findReadingsByMeterIDsAndPeriods(
                meterIds,
                startOfPreviousMonth,
                endOfPreviousMonth,
                startOfCurrentMonth,
                endOfCurrentMonth
            );

        return meters.map(meter => {
            const current = currentMonthReadings.find(curr => curr.generalMeterId === meter.id);
            const previous = previousMonthReadings.find(prev => prev.generalMeterId === meter.id);
            return {
                meterId: meter.id,
                meterStatus: meter.status,
                typeOfServiceId: meter.typeOfServiceId,
                reading: { current, previous }
            };
        });
    }

    public async getMeterReadingByHID({ houseId, managementCompanyId }: ReferenceGetMeterReadingByHID.Request) {
        const house = await this.houseRepository.findById(houseId);
        if (!house) {
            throw new RMQException(HOUSE_NOT_EXIST.message(houseId), HOUSE_NOT_EXIST.status);
        }
        let norms: INorm[] = [];
        try {
            norms = await this.normRepository.findByMCIDAndType(managementCompanyId, TypeOfNorm.General);
        } catch (e) {
            throw new RMQException(NORMS_NOT_EXIST.message, HttpStatus.NOT_FOUND);
        }

        const meterReadings = await this.getMeterReadingsByHouseIdFromDB(houseId, 15, 25); // ИСПРАВИТЬ !!!!!
        const activeReadings = meterReadings.filter(obj => obj.meterStatus === MeterStatus.Active);
        const npAndNIReadings = meterReadings.filter(obj => obj.meterStatus === MeterStatus.NotInstall);

        const newMeterReading: IGetMeterReading[] = [];

        newMeterReading.push(...await this.getActiveGeneralMeterReadings(activeReadings));
        newMeterReading.push(...await this.getNIGeneralMeterReadings(npAndNIReadings, house.commonArea, norms));

        return { meterReadings: newMeterReading };
    }

    public async getMeterReadingsByAIDsWithAllMeterInfo(
        apartments: IApartmentAndSubscriber[], start: number, end: number
    ) {

        const { apartmentWithMeters, currentMonthReadings, previousReadings } = await this.getMeterReadingsByAIDsFromDB(
            apartments, start, end
        );

        return apartmentWithMeters.map(apartment => {
            if (apartment.meters.length) {
                const currentMeters = apartment.meters.map(meter => {
                    const current = currentMonthReadings.filter(c => c.individualMeterId === meter.id);
                    const previous = previousReadings.filter(p => p.individualMeterId === meter.id);
                    return {
                        ...meter,
                        reading: { current, previous }
                    }
                });
                return {
                    ...apartment,
                    meters: currentMeters
                }
            }
            else return {
                ...apartment,
                meters: []
            }
        });

    }

    private async getMeterReadingsByAIDs(apartments: IApartmentAndSubscriber[], start: number, end: number)
        : Promise<ApartmentAndMeterReadings[]> {

        const { apartmentWithMeters, currentMonthReadings, previousReadings } = await this.getMeterReadingsByAIDsFromDB(
            apartments, start, end
        );

        return apartmentWithMeters.map(apartment => {
            if (apartment.meters.length) {
                const currentMeters = apartment.meters.map(meter => {
                    const current = currentMonthReadings.filter(c => c.individualMeterId === meter.id);
                    const previous = previousReadings.filter(p => p.individualMeterId === meter.id);
                    return {
                        meterId: meter.id,
                        meterStatus: meter.status,
                        typeOfServiceId: meter.typeOfServiceId,
                        reading: { current, previous }
                    }
                });
                return {
                    ...apartment,
                    meters: currentMeters
                }
            }
            else return {
                ...apartment,
                meters: []
            }
        });
    }

    private async getMeterReadingsByAIDsFromDB(apartments: IApartmentAndSubscriber[], start: number, end: number) {
        const currentDate = new Date();
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), start);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), end);

        const apartmentIds = apartments.map(obj => obj.apartmentId);
        const meters = await this.individualMeterRepository.findByApartments(apartmentIds);
        if (!meters && !meters.length) {
            throw new RMQException(METERS_NOT_EXIST.message, METERS_NOT_EXIST.status);
        }

        const meterIds = meters.map(obj => obj.id);
        const apartmentWithMeters = apartments.map(apartment => {
            const currMeters = meters.filter(obj => obj.apartmentId === apartment.apartmentId);
            return {
                ...apartment,
                meters: currMeters
            }
        });

        const { currentMonthReadings, previousReadings } =
            await this.individualMeterReadingRepository.findReadingsByMeterIDsAndPeriod(
                meterIds, startOfMonth, endOfMonth
            );

        return { apartmentWithMeters, currentMonthReadings, previousReadings };
    }

    private async getApartmentsBySIDs(subscriberIds: number[]): Promise<IApartmentAndSubscriber[]> {
        const subscribers = await this.subscriberRepository.findMany(subscriberIds);
        if (!subscribers && !subscribers.length) {
            throw new RMQException(SUBSCRIBERS_NOT_EXIST.message, SUBSCRIBERS_NOT_EXIST.status);
        }

        const dtoApartmentIds = subscribers.map(obj => obj.apartmentId);
        const apartments = await this.apartmentRepository.findMany(dtoApartmentIds);
        if (!apartments.length) {
            throw new RMQException(APARTS_NOT_EXIST.message, APARTS_NOT_EXIST.status);
        }

        return apartments.map(obj => {
            const currSubscriber = subscribers.find(sub => sub.apartmentId === obj.id);
            return {
                subscriberId: currSubscriber.id,
                apartmentId: currSubscriber.apartmentId,
                numberOfRegistered: obj.numberOfRegistered
            };
        });
    }

    public async getMeterReadingBySID(
        dto: ReferenceGetMeterReadingBySID.Request
    ) {
        const norms = await this.normRepository.findByMCIDAndType(dto.managementCompanyId, TypeOfNorm.Individual);
        if (!norms.length) {
            throw new RMQException(NORMS_NOT_EXIST.message, NORMS_NOT_EXIST.status);
        }


        const subscriberAndAparts = await this.getApartmentsBySIDs(dto.subscriberIds);
        const apartmentWithMeterReadings = await this.getMeterReadingsByAIDs(subscriberAndAparts, 15, 25); // ИСПРАВИТЬ!!!!

        const newMeterReading: IGetMeterReadings[] = [];
        for (const apartment of apartmentWithMeterReadings) {
            const meters: IndividualMeterWithReadings[] = apartment.meters;
            if (!meters.length) continue;

            const activeReadings = meters.filter(obj => obj.meterStatus === MeterStatus.Active);
            const npAndNIReadings = meters.filter(obj =>
                (obj.meterStatus === MeterStatus.NoPossibility) || (obj.meterStatus === MeterStatus.NotInstall));

            const temp: IGetMeterReading[] = [];
            try {
                temp.push(
                    ...await this.getActiveIndividualMeterReadings(
                        activeReadings, norms, apartment.numberOfRegistered
                    )
                );
                temp.push(
                    ...await this.getNPAndNIIndividualMeterReadings
                        (
                            npAndNIReadings,
                            apartment.numberOfRegistered,
                            norms
                        )
                );
            }
            catch (e) {
                throw new RMQException(e.message, e.status);
            }

            newMeterReading.push({
                subscriberId: apartment.subscriberId,
                data: temp
            });
        }

        return { meterReadings: newMeterReading };
    }

    private async getActiveIndividualMeterReadings(
        activeMeters: IndividualMeterWithReadings[], norms: INorm[], numberOfRegistered: number
    ): Promise<IGetMeterReading[]> {
        const temp = [];
        let reading: Reading;
        for (const meter of activeMeters) {
            reading = await this.calculateActiveIndividualMeterReadings(
                meter.meterId, meter.reading, meter.typeOfServiceId,
                norms, numberOfRegistered
            );
            const tempReading =
                'difference' in reading ? reading.difference :
                    'norm' in reading ? reading.norm :
                        'avgVolume' in reading ? reading.avgVolume : 0;
            temp.push({
                meterReadings: {
                    individualMeterId: meter.meterId,
                    reading: tempReading,
                    readAt: new Date()
                },
                typeOfServiceId: meter.typeOfServiceId,
                fullMeterReadings: reading
            });
        }
        return temp;
    }

    private async getActiveGeneralMeterReadings(
        activeMeterReadings: GeneralMeterWithReadings[]
    ): Promise<IGetMeterReading[]> {
        const temp: IGetMeterReading[] = [];
        for (const meter of activeMeterReadings) {
            if (!meter.reading.current) {
                throw new RMQException(
                    FAILED_TO_GET_CURRENT_READINGS.message(meter.meterId),
                    FAILED_TO_GET_CURRENT_READINGS.status
                );
            }
            if (meter.reading.previous) {
                const reading = meter.reading.current.reading - meter.reading.previous.reading;
                temp.push({
                    meterReadings: {
                        individualMeterId: meter.meterId,
                        reading: reading,
                        readAt: new Date()
                    },
                    typeOfServiceId: meter.typeOfServiceId,
                    fullMeterReadings: {
                        current: meter.reading.current.reading,
                        previous: meter.reading.previous.reading,
                        difference: reading
                    }
                })
            } else {
                temp.push({
                    meterReadings: {
                        individualMeterId: meter.meterId,
                        reading: meter.reading.current.reading,
                        readAt: new Date()
                    },
                    typeOfServiceId: meter.typeOfServiceId,
                    fullMeterReadings: {
                        current: meter.reading.current.reading,
                        previous: 0,
                        difference: meter.reading.current.reading
                    }
                })
            }
        }
        return temp;
    }

    private async getNIGeneralMeterReadings(
        npAndNIReadings: GeneralMeterWithReadings[], commonArea: number, norms: INorm[]
    ): Promise<IGetMeterReading[]> {
        const temp: IGetMeterReading[] = [];
        let norm: number, tempNorm: INorm[];
        for (const meter of npAndNIReadings) {
            tempNorm = norms.filter(norm => norm.typeOfServiceId === meter.typeOfServiceId);
            if (tempNorm.length > 0) {
                norm = tempNorm[0].norm;
            } else throw new RMQException(NORM_NOT_EXIST.message, NORM_NOT_EXIST.status);

            temp.push({
                meterReadings: {
                    individualMeterId: meter.meterId,
                    reading: norm * commonArea, // Норматив * площадь общедомовых помещений
                    readAt: new Date()
                }, typeOfServiceId: meter.typeOfServiceId,
                fullMeterReadings: {
                    norm: norm
                }
            });
        }
        return temp;
    }


    private async calculateActiveIndividualMeterReadings(
        meterId: number,
        reading: IndividualCurrentAndPrevReadings,
        typeOfServiceId: number,
        norms: INorm[],
        numberOfRegistered: number,
    ): Promise<Reading> {
        const currentDate = new Date();
        const { current: currentMonthReadings, previous: previousReadings } = reading;

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
    private calculateAverageConsumption(readings: IIndividualMeterReading[]): number {
        const volume = [];

        for (let i = readings.length - 1; i > 0; i--) {
            const consumption = readings[i - 1].reading - readings[i].reading;
            volume.push(consumption);
        }
        const averageConsumption = volume.reduce((sum, value) => sum + value, 0) / volume.length;
        return averageConsumption;
    }

    private async getNPAndNIIndividualMeterReadings(
        npAndNIMeters: IndividualMeterWithReadings[],
        numberOfRegistered: number,
        norms: INorm[],
    ): Promise<IGetMeterReading[]> {
        try {
            const temp: IGetMeterReading[] = [];
            let norm: number, tempNorm: INorm[];
            for (const meter of npAndNIMeters) {
                tempNorm = norms.filter(norm => norm.typeOfServiceId === meter.typeOfServiceId);
                if (tempNorm.length > 0) {
                    norm = tempNorm[0].norm;
                } else throw new RMQException(NORM_NOT_EXIST.message, NORM_NOT_EXIST.status);
                temp.push({
                    meterReadings: {
                        individualMeterId: meter.meterId,
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