import { IGeneralMeterReading, IGetMeterReading, IGetMeterReadings, IIndividualMeterReading, IMeta, IMeter, IMeterReading, INorm, MeterStatus, MeterType, TypeOfNorm } from "@myhome/interfaces";
import { HttpStatus, Injectable } from "@nestjs/common";
import { IGetHouseAllInfo, ReferenceGetIndividualMeterReadings, ReferenceGetMeterReadingsByHID, ReferenceGetMeterReadingsByUser } from "@myhome/contracts";
import { getGenericObject, METER_READING_NOT_EXIST, RMQException, INCORRECT_METER_TYPE, NORMS_NOT_EXIST } from "@myhome/constants";
import { HouseService } from "../../../subscriber/services/house.service";
import { SubscriberService, IApartmentAndSubscriber } from "../../../subscriber/services/subscriber.service";
import { NormRepository } from "../../../tariff-and-norm/base-tariff-and-norm.repository";
import { GeneralMeterReadingEntity } from "../../entities/general-meter-reading.entity";
import { IndividualMeterReadingEntity } from "../../entities/individual-meter-reading.entity";
import { GeneralMeterReadingRepository } from "../../repositories/general-meter-reading.repository";
import { GeneralMeterRepository } from "../../repositories/general-meter.repository";
import { IndividualMeterReadingRepository } from "../../repositories/individual-meter-reading.repository";
import { IndividualMeterRepository } from "../../repositories/individual-meter.repository";
import { MeterReadingCalculationsService } from "./meter-reading.calculations.service";

export type IndividualMeterWithReadings = {
    meterId: number,
    meterStatus: MeterStatus,
    typeOfServiceId: number,
    reading: IndividualCurrentAndPrevReadings
};

export type GeneralMeterWithReadings = {
    meterId: number,
    typeOfServiceId: number,
    reading: GeneralCurrentAndPrevReadings,
};

export type IndividualCurrentAndPrevReadings = {
    current: IIndividualMeterReading[]; previous: IIndividualMeterReading[]
};

type GeneralCurrentAndPrevReadings = {
    current: IGeneralMeterReading; previous: IGeneralMeterReading;
};

@Injectable()
export class MeterReadingQueriesService {
    constructor(
        private readonly individualMeterReadingRepository: IndividualMeterReadingRepository,
        private readonly generalMeterReadingRepository: GeneralMeterReadingRepository,
        private readonly individualMeterRepository: IndividualMeterRepository,
        private readonly generalMeterRepository: GeneralMeterRepository,
        private readonly houseService: HouseService,
        private readonly subscriberService: SubscriberService,
        private readonly normRepository: NormRepository,
        private readonly meterReadingCalculationsService: MeterReadingCalculationsService
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

    public async getMeterReadingsByUser(dto: ReferenceGetMeterReadingsByUser.Request): Promise<ReferenceGetMeterReadingsByUser.Response> {
        switch (dto.meterType) {
            case (MeterType.General): {
                const readings = await this.generalMeterReadingRepository.findByMeterId(dto.meterId);
                if (readings.length >= 2) {
                    const resultReadings = [];
                    for (let i = 0; i < readings.length; i++) {
                        const consumption = i < readings.length - 1 ? readings[i].reading - readings[i + 1].reading : readings[i].reading;
                        const resultReading = { ...readings[i], consumption };
                        resultReadings.push(resultReading);
                    }
                    return { readings: resultReadings };
                } else if (readings.length === 1) {
                    const resultReading = { ...readings[0], consumption: readings[0].reading };
                    return { readings: [resultReading] };
                } else {
                    return { readings: [] };
                }
            }
            case (MeterType.Individual): {
                const readings = await this.individualMeterReadingRepository.findByMeterId(dto.meterId);
                if (readings.length >= 2) {
                    const resultReadings = [];
                    for (let i = 0; i < readings.length; i++) {
                        const consumption = i < readings.length - 1 ? readings[i].reading - readings[i + 1].reading : readings[i].reading;
                        const resultReading = { ...readings[i], consumption };
                        resultReadings.push(resultReading);
                    }
                    return { readings: resultReadings };
                } else if (readings.length === 1) {
                    const resultReading = { ...readings[0], consumption: readings[0].reading };
                    return { readings: [resultReading] };
                } else {
                    return { readings: [] };
                }
            }
            default:
                throw new RMQException(INCORRECT_METER_TYPE, HttpStatus.CONFLICT);
        }

    }

    // получение показаний активных общедомовых счётчиков
    private async getActiveGeneralReadings(houseId: number, start: number, end: number):
        Promise<GeneralMeterWithReadings[]> {
        const {
            startOfPreviousMonth, endOfPreviousMonth,
            startOfCurrentMonth, endOfCurrentMonth
        } = this.meterReadingCalculationsService.getPeriods(start, end);

        const meters = await this.generalMeterRepository.findActiveReadingsByHIdAndPeriod(
            houseId,
            startOfPreviousMonth, endOfPreviousMonth,
            startOfCurrentMonth, endOfCurrentMonth
        );
        return meters;
    }

    // получение показаний общедомовых счётчиков
    public async getMeterReadingsByHID({ houseId, managementCompanyId }: ReferenceGetMeterReadingsByHID.Request) {
        const { house } = await this.getHouseAllInfo(houseId);
        let norms: INorm[] = [];
        try {
            norms = await this.normRepository.findByMCIDAndType(managementCompanyId, TypeOfNorm.General);
        } catch (e) {
            throw new RMQException(NORMS_NOT_EXIST.message, HttpStatus.NOT_FOUND);
        }

        // активных
        const activeReadings = await this.getActiveGeneralReadings(houseId, 15, 25); // ИСПРАВИТЬ !!!!!
        // по нормативу
        const npAndNIReadings = await this.generalMeterRepository.findNIAndNPReadingsByHId(houseId);

        const newMeterReading: IGetMeterReading[] = [];

        newMeterReading.push(...await this.meterReadingCalculationsService.getActiveGeneralMeterReadings(
            activeReadings
        ));
        newMeterReading.push(...await this.meterReadingCalculationsService.getNIAndNPGeneralMeterReadings(
            npAndNIReadings, house.commonArea, norms
        ));

        return { meterReadings: newMeterReading };
    }

    public async getMeterReadings(
        meterType: MeterType, meta: IMeta,
        houseIds?: number[], apartmentIds?: number[]
    ): Promise<{
        meters: {
            meter: IMeter,
            reading: {
                previous: IMeterReading | undefined;
                current: IMeterReading | undefined;
            }
        }[],
        totalCount?: number
    }> {
        switch (meterType) {
            case (MeterType.General):
                return await this.generalMeterRepository.
                    findReadingsByHIdsAndPeriod(
                        houseIds, meta
                    );
            case (MeterType.Individual):
                return await this.individualMeterRepository.
                    findReadingsByAIdsAndPeriod(
                        apartmentIds, meta
                    );
            default:
                throw new RMQException(INCORRECT_METER_TYPE, HttpStatus.CONFLICT);
        }
    }

    // для расчёта ЕПД, т.е. показания могут быть расчётными
    public async getIndividualMeterReadings(dto: ReferenceGetIndividualMeterReadings.Request)
        : Promise<ReferenceGetIndividualMeterReadings.Response> {
        let apartments: IApartmentAndSubscriber[] = [];

        if (dto.subscriberIds) {
            apartments = await this.subscriberService.getApartmentsBySIDs(dto.subscriberIds);
        } else if (dto.houseId) {
            apartments = await this.subscriberService.getSubscribersByHId(dto.houseId);
        } else {
            throw new RMQException("Не было передано ни houseId, ни subscribersIds", HttpStatus.BAD_REQUEST);
        }

        const managementCompanyId = dto.managementCompanyId;
        const norms = await this.normRepository.findByMCIDAndType(managementCompanyId, TypeOfNorm.Individual);
        if (!norms.length) {
            throw new RMQException(NORMS_NOT_EXIST.message, NORMS_NOT_EXIST.status);
        }

        // Получить apartmentIds
        const apartmentIds = apartments.map((apartment) => apartment.apartmentId);

        // активные счетчики
        const activeMeters = await this.findReadingsByAIdsAndPeriod(apartmentIds, 15, 25); // ИСПРАВИТЬ!!!
        // норматив
        const npAndNIMeters = await this.individualMeterRepository.findNIAndNPReadingsByHId(apartmentIds);

        const meterReadings: IGetMeterReadings[] = [];

        for (const apartment of apartments) {
            const temp: IGetMeterReading[] = [];
            const currentActiveMeters = activeMeters.filter(meter => meter.apartmentId === apartment.apartmentId);
            const currentNPAndNIMeters = npAndNIMeters.filter(meter => meter.apartmentId === apartment.apartmentId);

            try {
                temp.push(
                    ...await this.meterReadingCalculationsService.getActiveIndividualMeterReadings(
                        currentActiveMeters,
                        norms,
                        apartment.numberOfRegistered
                    )
                );

                temp.push(
                    ...await this.meterReadingCalculationsService.getNPAndNIIndividualMeterReadings(
                        currentNPAndNIMeters,
                        apartment.numberOfRegistered,
                        norms
                    )
                );
            } catch (e) {
                throw new RMQException(e.message, e.status);
            }

            meterReadings.push({
                subscriberId: apartment.subscriberId,
                data: temp,
            });
        }

        return { meterReadings };
    }

    private async findReadingsByAIdsAndPeriod(apartmentIds: number[], start: number, end: number) {
        const currentDate = new Date();
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), start);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), end + 1);
        return await this.individualMeterRepository.findActiveReadingsByAIdsAndPeriod(
            apartmentIds,
            startOfMonth,
            endOfMonth
        );
    }

    private async getHouseAllInfo(houseId: number) {
        const { houses } = await this.houseService.getHouses({
            houseIds: [houseId],
            isAllInfo: true
        });
        if (!houses) return;
        return { house: houses[0] as IGetHouseAllInfo };
    }
}