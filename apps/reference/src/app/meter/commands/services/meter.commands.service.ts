import {
    METER_NOT_EXIST, INCORRECT_METER_TYPE,
    METER_ALREADY_EXIST,
    RMQException, addGenericObject
} from "@myhome/constants";
import { ReferenceExpireMeter, ReferenceAddMeter } from "@myhome/contracts";
import { IGeneralMeter, IIndividualMeter, MeterType } from "@myhome/interfaces";
import { Injectable, HttpStatus } from "@nestjs/common";

import { Cron } from "@nestjs/schedule";
import { GeneralMeterEntity } from "../../entities/general-meter.entity";
import { IndividualMeterEntity } from "../../entities/individual-meter.entity";
import { MeterEventEmitter } from "../../meter.event-emitter";
import { GeneralMeterRepository } from "../../repositories/general-meter.repository";
import { IndividualMeterRepository } from "../../repositories/individual-meter.repository";

export type Meters = IndividualMeterEntity | GeneralMeterEntity;

@Injectable()
export class MeterCommandsService {
    constructor(
        private readonly individualMeterRepository: IndividualMeterRepository,
        private readonly generalMeterRepository: GeneralMeterRepository,
        private readonly meterEventEmitter: MeterEventEmitter,
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
        let existedMeter: Meters;

        switch (dto.meterType) {
            case (MeterType.General):
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