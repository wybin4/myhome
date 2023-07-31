import { METER_READING_NOT_EXIST, INCORRECT_METER_TYPE, METER_NOT_EXIST, NORM_NOT_EXIST, APART_NOT_EXIST } from "@myhome/constants";
import { IGeneralMeterReading, IHouse, IIndividualMeterReading, MeterStatus, MeterType } from "@myhome/interfaces";
import { HttpStatus, Injectable } from "@nestjs/common";
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
    public async getMeterReadingBySID(dto: ReferenceGetMeterReadingBySID.Request): Promise<ReferenceGetMeterReadingBySID.Response> {
        const apartment = await this.apartmentRepository.findApartmentById(dto.subscriber.apartmentId);
        if (!apartment) {
            throw new RMQError(APART_NOT_EXIST, ERROR_TYPE.RMQ, HttpStatus.NOT_FOUND);
        }
        let activeMeters: Meters[];
        const newMeterReading: IGetMeterReadingBySID[] = [];
        let house: IHouse;

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
                newMeterReading.push(...await this.getActiveMeterReadings(apartment.id));
                newMeterReading.push(
                    ...await this.getNPAndNIMeterReadings
                        (
                            apartment.id,
                            apartment.numberOfRegistered,
                            dto.managementCompanyId,
                            [MeterStatus.NoPossibility, MeterStatus.NotInstall]
                        )
                );
                return { meterReadings: newMeterReading };
            default:
                throw new RMQError(INCORRECT_METER_TYPE, ERROR_TYPE.RMQ, HttpStatus.CONFLICT);
        }
    }

    private async getActiveMeterReadings(apartmentId: number) {
        const temp = [];
        const activeMeters = await this.individualMeterRepository.findByApartmentAndStatus(apartmentId, [MeterStatus.Active]);
        for (const meter of activeMeters) {
            const readings = await this.individualMeterReadingRepository.findLastTwoReadingByMeterID(meter.id);
            temp.push({
                meterReadings: {
                    individualMeterId: meter.id,
                    reading: readings[0].reading - readings[1].reading,
                    readAt: readings[0].readAt,
                }, typeOfSeriveId: meter.typeOfServiceId
            });
        }
        return temp;
    }

    private async getNPAndNIMeterReadings(apartmentId: number, numberOfRegistered: number, managementCompanyId: number, meterStatus: MeterStatus[]) {
        const temp = [];
        const meters = await this.individualMeterRepository.findByApartmentAndStatus(apartmentId, meterStatus);
        for (const meter of meters) {
            let norm: number;
            try {
                norm = (await this.normRepository.findByMCIDAndTOSID(managementCompanyId, meter.typeOfServiceId)).norm;
            } catch (e) {
                throw new RMQError(NORM_NOT_EXIST, ERROR_TYPE.RMQ, HttpStatus.NOT_FOUND);
            }
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