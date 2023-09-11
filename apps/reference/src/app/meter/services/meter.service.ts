import { METER_NOT_EXIST, INCORRECT_METER_TYPE, APART_NOT_EXIST, METER_ALREADY_EXIST, HOUSE_NOT_EXIST, TYPE_OF_SERVICE_NOT_EXIST, RMQException, getGenericObject, addGenericObject } from "@myhome/constants";
import { IGeneralMeter, IIndividualMeter, MeterType } from "@myhome/interfaces";
import { HttpStatus, Injectable } from "@nestjs/common";
import { GeneralMeterEntity } from "../entities/general-meter.entity";
import { IndividualMeterEntity } from "../entities/individual-meter.entity";
import { GeneralMeterRepository } from "../repositories/general-meter.repository";
import { IndividualMeterRepository } from "../repositories/individual-meter.repository";
import { ReferenceAddMeter, ReferenceExpireMeter } from "@myhome/contracts";
import { ApartmentRepository } from "../../subscriber/repositories/apartment.repository";
import { HouseRepository } from "../../subscriber/repositories/house.repository";
import { ApartmentEntity } from "../../subscriber/entities/apartment.entity";
import { HouseEntity } from "../../subscriber/entities/house.entity";
import { MeterEventEmitter } from "../meter.event-emitter";
import { Cron } from "@nestjs/schedule";
import { TypeOfServiceRepository } from "../../common/repositories/type-of-service.repository";

export type Meters = IndividualMeterEntity | GeneralMeterEntity;

@Injectable()
export class MeterService {
    constructor(
        private readonly individualMeterRepository: IndividualMeterRepository,
        private readonly generalMeterRepository: GeneralMeterRepository,
        private readonly apartmentRepository: ApartmentRepository,
        private readonly houseRepository: HouseRepository,
        private readonly meterEventEmitter: MeterEventEmitter,
        private readonly typeOfServicesRepository: TypeOfServiceRepository,
    ) { }

    @Cron('0 9 * * *')
    async checkMetersAndSendEvent() {
        const generalMeters = await this.generalMeterRepository.findExpiredGeneralMeters();
        const individualMeters = await this.individualMeterRepository.findExpiredIndividualMeters();

        this.changeMeterStatus(generalMeters);
        this.changeMeterStatus(individualMeters);

        await this.generalMeterRepository.saveMany(generalMeters);
        await this.individualMeterRepository.save(individualMeters);

        await this.meterEventEmitter.handle(
            {
                topic: ReferenceExpireMeter.topic,
                data: { generalMeters, individualMeters }
            }
        );
    }

    private changeMeterStatus(meters: GeneralMeterEntity[] | IndividualMeterEntity[]) {
        for (const meter of meters) {
            meter.expire();
        }
    }

    public async getMeter(id: number, meterType: MeterType) {
        switch (meterType) {
            case (MeterType.General):
                return {
                    meter: await getGenericObject<GeneralMeterEntity>
                        (
                            this.generalMeterRepository,
                            (item) => new GeneralMeterEntity(item),
                            id,
                            METER_NOT_EXIST
                        )
                };
            case (MeterType.Individual):
                return {
                    meter: await getGenericObject<IndividualMeterEntity>
                        (
                            this.individualMeterRepository,
                            (item) => new IndividualMeterEntity(item),
                            id,
                            METER_NOT_EXIST
                        )
                };
            default:
                throw new RMQException(INCORRECT_METER_TYPE, HttpStatus.CONFLICT);
        }
    }

    public async addMeter(dto: ReferenceAddMeter.Request) {
        let apartment: ApartmentEntity;
        let house: HouseEntity;
        let existedMeter: Meters;

        const typeOfService = await this.typeOfServicesRepository.findById(dto.typeOfServiceId);
        if (!typeOfService) {
            throw new RMQException(TYPE_OF_SERVICE_NOT_EXIST.message(dto.typeOfServiceId), TYPE_OF_SERVICE_NOT_EXIST.status);
        }
        switch (dto.meterType) {
            case (MeterType.General):
                house = await this.houseRepository.findById(dto.houseId);
                if (!house) {
                    throw new RMQException(HOUSE_NOT_EXIST.message(dto.houseId), HOUSE_NOT_EXIST.status);
                }
                existedMeter = await this.generalMeterRepository.findByFNumber(dto.factoryNumber);
                if (existedMeter) {
                    throw new RMQException(METER_ALREADY_EXIST, HttpStatus.CONFLICT);
                }
                return {
                    meter: await addGenericObject<GeneralMeterEntity>(
                        this.generalMeterRepository,
                        (item) => new GeneralMeterEntity(item),
                        {
                            typeOfServiceId: dto.typeOfServiceId,
                            houseId: dto.houseId,
                            factoryNumber: dto.factoryNumber,
                            verifiedAt: new Date(dto.verifiedAt),
                            issuedAt: new Date(dto.issuedAt),
                        } as IGeneralMeter
                    )
                };
            case (MeterType.Individual):
                apartment = await this.apartmentRepository.findById(dto.apartmentId);
                if (!apartment) {
                    throw new RMQException(APART_NOT_EXIST.message(dto.apartmentId), APART_NOT_EXIST.status);
                }
                existedMeter = await this.individualMeterRepository.findByFNumber(dto.factoryNumber);
                if (existedMeter) {
                    throw new RMQException(METER_ALREADY_EXIST, HttpStatus.CONFLICT);
                }
                return {
                    meter: await addGenericObject<IndividualMeterEntity>(
                        this.individualMeterRepository,
                        (item) => new IndividualMeterEntity(item),
                        {
                            typeOfServiceId: dto.typeOfServiceId,
                            apartmentId: dto.apartmentId,
                            factoryNumber: dto.factoryNumber,
                            verifiedAt: new Date(dto.verifiedAt),
                            issuedAt: new Date(dto.issuedAt)
                        } as IIndividualMeter
                    )
                };
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