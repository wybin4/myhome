import {
    METER_NOT_EXIST, INCORRECT_METER_TYPE,
    METER_ALREADY_EXIST,
    RMQException, APART_NOT_EXIST, TYPE_OF_SERVICE_NOT_EXIST, HOUSE_NOT_EXIST
} from "@myhome/constants";
import { ReferenceAddMeter } from "@myhome/contracts";
import {  MeterType } from "@myhome/interfaces";
import { Injectable, HttpStatus } from "@nestjs/common";

import { Cron } from "@nestjs/schedule";
import { GeneralMeterEntity } from "../../entities/general-meter.entity";
import { IndividualMeterEntity } from "../../entities/individual-meter.entity";
import { MeterEventEmitter } from "../../meter.event-emitter";
import { GeneralMeterRepository } from "../../repositories/general-meter.repository";
import { IndividualMeterRepository } from "../../repositories/individual-meter.repository";
import { ApartmentRepository } from "../../../subscriber/repositories/apartment.repository";
import { TypeOfServiceRepository } from "../../../common/repositories/type-of-service.repository";
import { HouseRepository } from "../../../subscriber/repositories/house.repository";
import { GeneralMeterReadingRepository } from "../../repositories/general-meter-reading.repository";
import { GeneralMeterReadingEntity } from "../../entities/general-meter-reading.entity";
import { IndividualMeterReadingEntity } from "../../entities/individual-meter-reading.entity";
import { IndividualMeterReadingRepository } from "../../repositories/individual-meter-reading.repository";

export type Meters = IndividualMeterEntity | GeneralMeterEntity;

@Injectable()
export class MeterCommandsService {
    constructor(
        private readonly individualMeterRepository: IndividualMeterRepository,
        private readonly generalMeterRepository: GeneralMeterRepository,
        private readonly generalMeterReadingRepository: GeneralMeterReadingRepository,
        private readonly individualMeterReadingRepository: IndividualMeterReadingRepository,
        private readonly meterEventEmitter: MeterEventEmitter,
        private readonly apartmentRepository: ApartmentRepository,
        private readonly houseRepository: HouseRepository,
        private readonly typeOfServiceRepository: TypeOfServiceRepository
    ) { }

    @Cron('0 9 * * *')
    async checkMetersAndSendEvent() {
        const generalMeters = await this.generalMeterRepository.findExpiredGeneralMeters();
        const individualMeters = await this.individualMeterRepository.findExpiredIndividualMeters();

        this.changeMeterStatus(generalMeters);
        this.changeMeterStatus(individualMeters);

        await this.generalMeterRepository.saveMany(generalMeters);
        await this.individualMeterRepository.save(individualMeters);

        // ИСПРАВИТЬ
        // await this.meterEventEmitter.handle(
        //     {
        //         topic: ReferenceExpireMeter.topic,
        //         data: { generalMeters, individualMeters }
        //     }
        // );
    }

    private changeMeterStatus(meters: GeneralMeterEntity[] | IndividualMeterEntity[]) {
        for (const meter of meters) {
            meter.expire();
        }
    }

    public async addMeter(dto: ReferenceAddMeter.Request): Promise<ReferenceAddMeter.Response> {
        const typeOfService = await this.typeOfServiceRepository.findById(dto.typeOfServiceId);
        if (!typeOfService) {
            throw new RMQException(TYPE_OF_SERVICE_NOT_EXIST.message(dto.typeOfServiceId), TYPE_OF_SERVICE_NOT_EXIST.status);
        }
        const previousReading = dto.previousReading;
        const previousReadAt = new Date(dto.previousReadAt);

        switch (dto.meterType) {
            case (MeterType.General): {
                const existedMeter = await this.generalMeterRepository.findByFNumber(dto.factoryNumber);
                if (existedMeter) {
                    throw new RMQException(METER_ALREADY_EXIST, HttpStatus.CONFLICT);
                }
                const house = await this.houseRepository.findById(dto.houseId);
                if (!house) {
                    throw new RMQException(HOUSE_NOT_EXIST.message(dto.apartmentId), HOUSE_NOT_EXIST.status);
                }

                const newMeter = new GeneralMeterEntity({
                    ...dto,
                    verifiedAt: new Date(dto.verifiedAt),
                    issuedAt: new Date(dto.issuedAt)
                });
                const meter = await this.generalMeterRepository.create(newMeter);

                const newMeterReading = new GeneralMeterReadingEntity({
                    generalMeterId: meter.id,
                    reading: previousReading,
                    readAt: previousReadAt
                });
                await this.generalMeterReadingRepository.create(newMeterReading);

                return {
                    meter: {
                        ...meter,
                        houseName: house.getAddress(),
                        typeOfServiceName: typeOfService.name,
                        currentReading: undefined,
                        currentReadAt: undefined,
                        previousReading,
                        previousReadAt
                    }
                }
            }
            case (MeterType.Individual): {
                const existedMeter = await this.individualMeterRepository.findByFNumber(dto.factoryNumber);
                if (existedMeter) {
                    throw new RMQException(METER_ALREADY_EXIST, HttpStatus.CONFLICT);
                }
                const apartment = await this.apartmentRepository.findByIdWithHouse(dto.apartmentId);
                if (!apartment) {
                    throw new RMQException(APART_NOT_EXIST.message(dto.apartmentId), APART_NOT_EXIST.status);
                }

                const newMeter = new IndividualMeterEntity({
                    ...dto,
                    verifiedAt: new Date(dto.verifiedAt),
                    issuedAt: new Date(dto.issuedAt)
                });
                const meter = await this.individualMeterRepository.create(newMeter);

                const newMeterReading = new IndividualMeterReadingEntity({
                    individualMeterId: meter.id,
                    reading: previousReading,
                    readAt: previousReadAt
                });
                await this.individualMeterReadingRepository.create(newMeterReading);

                return {
                    meter: {
                        ...meter,
                        houseName: apartment.getAddress(apartment.house),
                        typeOfServiceName: typeOfService.name,
                        currentReading: undefined,
                        currentReadAt: undefined,
                        previousReading,
                        previousReadAt
                    }
                }
            }
            default:
                throw new RMQException(INCORRECT_METER_TYPE, HttpStatus.CONFLICT);
        }
    }

    public async updateMeter(id: number, verifiedAt: Date, meterType: MeterType) {
        let existedMeter: Meters, meterEntity: Promise<GeneralMeterEntity> | Promise<IndividualMeterEntity>;

        switch (meterType) {
            case (MeterType.General):
                existedMeter = await this.generalMeterRepository.findById(id);
                if (!existedMeter) {
                    throw new RMQException(METER_NOT_EXIST.message(id), METER_NOT_EXIST.status);
                }
                meterEntity = new GeneralMeterEntity(existedMeter).update(verifiedAt);
                return Promise.all([
                    this.generalMeterRepository.update(await meterEntity),
                ]);
            case (MeterType.Individual):
                existedMeter = await this.individualMeterRepository.findById(id);
                if (!existedMeter) {
                    throw new RMQException(METER_NOT_EXIST.message(id), METER_NOT_EXIST.status);
                }
                meterEntity = new IndividualMeterEntity(existedMeter).update(verifiedAt);
                return Promise.all([
                    this.individualMeterRepository.update(await meterEntity),
                ]);
            default:
                throw new RMQException(INCORRECT_METER_TYPE, HttpStatus.CONFLICT);
        }
    }
}