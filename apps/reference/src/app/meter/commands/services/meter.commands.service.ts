import {
    METER_NOT_EXIST, INCORRECT_METER_TYPE,
    RMQException,
    TYPES_OF_SERVICE_NOT_EXIST,
    METERS_ALREADY_EXIST,
    HOUSES_NOT_EXIST,
    APARTS_NOT_EXIST,
} from "@myhome/constants";
import { MeterType } from "@myhome/interfaces";
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
import { IndividualMeterReadingRepository } from "../../repositories/individual-meter-reading.repository";
import { ReferenceAddMeters, ReferenceUpdateMeter } from "@myhome/contracts";
import { GeneralMeterReadingEntity } from "../../entities/general-meter-reading.entity";
import { IndividualMeterReadingEntity } from "../../entities/individual-meter-reading.entity";

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

    public async addMeters(dto: ReferenceAddMeters.Request): Promise<ReferenceAddMeters.Response> {
        const typeOfServices = await this.typeOfServiceRepository.findMany(dto.meters.map(m => m.typeOfServiceId));
        if (!typeOfServices.length) {
            throw new RMQException(TYPES_OF_SERVICE_NOT_EXIST.message, TYPES_OF_SERVICE_NOT_EXIST.status);
        }

        switch (dto.meterType) {
            case (MeterType.General): {
                const existedMeters = await this.generalMeterRepository.findByFNumbers(dto.meters.map(m => String(m.factoryNumber)));
                if (existedMeters.length) {
                    throw new RMQException(METERS_ALREADY_EXIST.message, METERS_ALREADY_EXIST.status);
                }
                const houses = await this.houseRepository.findMany(dto.meters.map(m => m.houseId));
                if (!houses.length) {
                    throw new RMQException(HOUSES_NOT_EXIST.message, HOUSES_NOT_EXIST.status);
                }

                const newMeters = dto.meters.map(m => {
                    return new GeneralMeterEntity({
                        ...m,
                        factoryNumber: String(m.factoryNumber),
                        verifiedAt: new Date(m.verifiedAt),
                        issuedAt: new Date(m.issuedAt)
                    });
                });
                const meters = await this.generalMeterRepository.createMany(newMeters);

                const newMeterReadings = meters.map(m => {
                    const currDto = dto.meters.find(dm => String(dm.factoryNumber) === m.factoryNumber);
                    if (currDto.previousReading) {
                        return new GeneralMeterReadingEntity({
                            generalMeterId: m.id,
                            reading: currDto.previousReading,
                            readAt: new Date(currDto.previousReadAt)
                        });
                    } else {
                        return undefined;
                    }
                }).filter(nm => nm);
                if (newMeterReadings.length) {
                    await this.generalMeterReadingRepository.createMany(newMeterReadings);
                }

                return {
                    meters: meters.map(meter => {
                        const currDto = dto.meters.find(dm => String(dm.factoryNumber) === meter.factoryNumber);
                        const currHouse = houses.find(h => h.id === meter.houseId);
                        const currToS = typeOfServices.find(tos => tos.id === meter.typeOfServiceId);
                        return {
                            ...meter,
                            houseName: currHouse.getAddress(),
                            typeOfServiceName: currToS.name,
                            currentReading: undefined,
                            currentReadAt: undefined,
                            previousReading: currDto.previousReading,
                            previousReadAt: currDto.previousReadAt ? new Date(currDto.previousReadAt) : undefined
                        };
                    })
                }
            }
            case (MeterType.Individual): {
                const existedMeters = await this.individualMeterRepository.findByFNumbers(dto.meters.map(m => String(m.factoryNumber)));
                if (existedMeters.length) {
                    throw new RMQException(METERS_ALREADY_EXIST.message, METERS_ALREADY_EXIST.status);
                }
                const apartments = await this.apartmentRepository.findByIdWithHouse(dto.meters.map(m => m.apartmentId));
                if (!apartments.length) {
                    throw new RMQException(APARTS_NOT_EXIST.message, APARTS_NOT_EXIST.status);
                }

                const newMeters = dto.meters.map(m => {
                    return new IndividualMeterEntity({
                        ...m,
                        factoryNumber: String(m.factoryNumber),
                        verifiedAt: new Date(m.verifiedAt),
                        issuedAt: new Date(m.issuedAt)
                    });
                });
                const meters = await this.individualMeterRepository.createMany(newMeters);

                const newMeterReadings = meters.map(m => {
                    const currDto = dto.meters.find(dm => String(dm.factoryNumber) === m.factoryNumber);
                    if (currDto.previousReading) {
                        return new IndividualMeterReadingEntity({
                            individualMeterId: m.id,
                            reading: currDto.previousReading,
                            readAt: new Date(currDto.previousReadAt)
                        });
                    } else {
                        return undefined;
                    }
                }).filter(nm => nm);
                if (newMeterReadings.length) {
                    await this.individualMeterReadingRepository.createMany(newMeterReadings);
                }

                return {
                    meters: meters.map(meter => {
                        const currDto = dto.meters.find(dm => String(dm.factoryNumber) === meter.factoryNumber);
                        const currApartment = apartments.find(h => h.id === meter.apartmentId);
                        const currToS = typeOfServices.find(tos => tos.id === meter.typeOfServiceId);
                        return {
                            ...meter,
                            houseName: currApartment.getAddress(currApartment.house),
                            typeOfServiceName: currToS.name,
                            currentReading: undefined,
                            currentReadAt: undefined,
                            previousReading: currDto.previousReading,
                            previousReadAt: currDto.previousReadAt ? new Date(currDto.previousReadAt) : undefined
                        };
                    })
                }
            }
            default:
                throw new RMQException(INCORRECT_METER_TYPE, HttpStatus.CONFLICT);
        }
    }

    public async updateMeter(dto: ReferenceUpdateMeter.Request): Promise<ReferenceUpdateMeter.Response> {
        switch (dto.meterType) {
            case (MeterType.General): {

                const existedMeter = await this.generalMeterRepository.findById(dto.id);
                if (!existedMeter) {
                    throw new RMQException(METER_NOT_EXIST.message(dto.id), METER_NOT_EXIST.status);
                }
                const meterEntity = new GeneralMeterEntity(existedMeter).update(new Date(dto.verifiedAt), new Date(dto.issuedAt));
                return { meter: await this.generalMeterRepository.update(await meterEntity) };
            }
            case (MeterType.Individual): {
                const existedMeter = await this.individualMeterRepository.findById(dto.id);
                if (!existedMeter) {
                    throw new RMQException(METER_NOT_EXIST.message(dto.id), METER_NOT_EXIST.status);
                }

                const meterEntity = new IndividualMeterEntity(existedMeter).update(new Date(dto.verifiedAt), new Date(dto.issuedAt));
                return { meter: await this.individualMeterRepository.update(await meterEntity) };
            }
            default:
                throw new RMQException(INCORRECT_METER_TYPE, HttpStatus.CONFLICT);
        }
    }
}