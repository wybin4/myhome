import { METER_NOT_EXIST, INCORRECT_METER_TYPE, APART_NOT_EXIST, METER_ALREADY_EXIST, HOME_NOT_EXIST } from "@myhome/constants";
import { IGeneralMeter, IIndividualMeter, MeterType } from "@myhome/interfaces";
import { HttpStatus, Injectable } from "@nestjs/common";
import { RMQError } from "nestjs-rmq";
import { ERROR_TYPE } from "nestjs-rmq/dist/constants";
import { GeneralMeterEnitity } from "../entities/general-meter.entity";
import { IndividualMeterEnitity } from "../entities/individual-meter.entity";
import { GeneralMeterRepository } from "../repositories/general-meter.repository";
import { IndividualMeterRepository } from "../repositories/individual-meter.repository";
import { ReferenceAddMeter, ReferenceExpireMeter } from "@myhome/contracts";
import { ApartmentRepository } from "../../subscriber/repositories/apartment.repository";
import { HouseRepository } from "../../subscriber/repositories/house.repository";
import { ApartmentEnitity } from "../../subscriber/entities/apartment.entity";
import { HouseEnitity } from "../../subscriber/entities/house.entity";
import { MeterEventEmitter } from "../meter.event-emitter";
import { Cron } from "@nestjs/schedule";

export type Meters = IndividualMeterEnitity | GeneralMeterEnitity;

@Injectable()
export class MeterService {
    constructor(
        private readonly individualMeterRepository: IndividualMeterRepository,
        private readonly generalMeterRepository: GeneralMeterRepository,
        private readonly apartmentRepository: ApartmentRepository,
        private readonly houseRepository: HouseRepository,
        private readonly meterEventEmitter: MeterEventEmitter,
    ) { }

    @Cron('0 9 * * *')
    async checkMetersAndSendEvent() {
        const generalMeters = await this.generalMeterRepository.findExpiredGeneralMeters();
        const individualMeters = await this.individualMeterRepository.findExpiredIndividualMeters();

        this.changeMeterStatus(generalMeters);
        this.changeMeterStatus(individualMeters);

        await this.generalMeterRepository.saveGeneralMeters(generalMeters);
        await this.individualMeterRepository.saveIndividualMeters(individualMeters);

        await this.meterEventEmitter.handle(
            {
                topic: ReferenceExpireMeter.topic,
                data: { generalMeters, individualMeters }
            }
        );
    }

    private changeMeterStatus(meters: GeneralMeterEnitity[] | IndividualMeterEnitity[]) {
        for (const meter of meters) {
            meter.expire();
        }
    }

    public async getMeter(id: number, meterType: MeterType) {
        let meter: GeneralMeterEnitity | IndividualMeterEnitity;
        let gettedMeter: Omit<IGeneralMeter | IIndividualMeter, 'id'>;
        switch (meterType) {
            case (MeterType.General):
                meter = await this.generalMeterRepository.findGeneralMeterById(id);
                if (!meter) {
                    throw new RMQError(METER_NOT_EXIST, ERROR_TYPE.RMQ, HttpStatus.NOT_FOUND);
                }
                gettedMeter = new GeneralMeterEnitity(meter).getGeneralMeter();
                return { gettedMeter };
            case (MeterType.Individual):
                meter = await this.individualMeterRepository.findIndividualMeterById(id);
                if (!meter) {
                    throw new RMQError(METER_NOT_EXIST, ERROR_TYPE.RMQ, HttpStatus.NOT_FOUND);
                }
                gettedMeter = new IndividualMeterEnitity(meter).getIndividualMeter();
                return { gettedMeter };
            default:
                throw new RMQError(INCORRECT_METER_TYPE, ERROR_TYPE.RMQ, HttpStatus.CONFLICT);
        }

    }

    public async addMeter(dto: ReferenceAddMeter.Request) {
        let apartment: ApartmentEnitity;
        let house: HouseEnitity;
        let existedMeter: Meters,
            newMeter: Meters,
            newMeterEntity: Meters;
        switch (dto.meterType) {
            case (MeterType.General):
                house = await this.houseRepository.findHouseById(dto.houseId);
                if (!house) {
                    throw new RMQError(HOME_NOT_EXIST, ERROR_TYPE.RMQ, HttpStatus.NOT_FOUND);
                }
                existedMeter = await this.generalMeterRepository.findIndividualMeterByFNumber(dto.factoryNumber);
                if (existedMeter) {
                    throw new RMQError(METER_ALREADY_EXIST, ERROR_TYPE.RMQ, HttpStatus.CONFLICT);
                }
                newMeterEntity = new GeneralMeterEnitity({
                    typeOfServiceId: dto.typeOfServiceId,
                    houseId: dto.houseId,
                    factoryNumber: dto.factoryNumber,
                    verifiedAt: new Date(dto.verifiedAt),
                    issuedAt: new Date(dto.issuedAt),
                });
                newMeter = await this.generalMeterRepository.createGeneralMeter(newMeterEntity);
                return { newMeter };
            case (MeterType.Individual):
                apartment = await this.apartmentRepository.findApartmentById(dto.apartmentId);
                if (!apartment) {
                    throw new RMQError(APART_NOT_EXIST, ERROR_TYPE.RMQ, HttpStatus.NOT_FOUND);
                }
                existedMeter = await this.individualMeterRepository.findIndividualMeterByFNumber(dto.factoryNumber);
                if (existedMeter) {
                    throw new RMQError(METER_ALREADY_EXIST, ERROR_TYPE.RMQ, HttpStatus.CONFLICT);
                }
                newMeterEntity = new IndividualMeterEnitity({
                    typeOfServiceId: dto.typeOfServiceId,
                    apartmentId: dto.apartmentId,
                    factoryNumber: dto.factoryNumber,
                    verifiedAt: new Date(dto.verifiedAt),
                    issuedAt: new Date(dto.issuedAt),
                });
                newMeter = await this.individualMeterRepository.createIndividualMeter(newMeterEntity);
                return { newMeter };
            default:
                throw new RMQError(INCORRECT_METER_TYPE, ERROR_TYPE.RMQ, HttpStatus.CONFLICT);
        }
    }

    public async updateMeter(id: number, verifiedAt: Date, meterType: MeterType) {
        let existedMeter: Meters, meterEntity: Promise<GeneralMeterEnitity> | Promise<IndividualMeterEnitity>;

        switch (meterType) {
            case (MeterType.General):
                existedMeter = await this.generalMeterRepository.findGeneralMeterById(id);
                if (!existedMeter) {
                    throw new RMQError(METER_NOT_EXIST, ERROR_TYPE.RMQ, HttpStatus.NOT_FOUND);
                }
                meterEntity = new GeneralMeterEnitity(existedMeter).updateGeneralMeter(verifiedAt);
                return Promise.all([
                    this.generalMeterRepository.updateGeneralMeter(await meterEntity),
                ]);
            case (MeterType.Individual):
                existedMeter = await this.individualMeterRepository.findIndividualMeterById(id);
                if (!existedMeter) {
                    throw new RMQError(METER_NOT_EXIST, ERROR_TYPE.RMQ, HttpStatus.NOT_FOUND);
                }
                meterEntity = new IndividualMeterEnitity(existedMeter).updateIndividualMeter(verifiedAt);
                return Promise.all([
                    this.individualMeterRepository.updateIndividualMeter(await meterEntity),
                ]);
            default:
                throw new RMQError(INCORRECT_METER_TYPE, ERROR_TYPE.RMQ, HttpStatus.CONFLICT);
        }
    }
}