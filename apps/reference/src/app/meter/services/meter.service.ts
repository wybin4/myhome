import { METER_NOT_EXIST, INCORRECT_METER_TYPE, APART_NOT_EXIST, METER_ALREADY_EXIST, HOME_NOT_EXIST, TYPE_OF_SERVICE_NOT_EXIST } from "@myhome/constants";
import { IGeneralMeter, IIndividualMeter, MeterType } from "@myhome/interfaces";
import { HttpStatus, Injectable } from "@nestjs/common";
import { RMQError } from "nestjs-rmq";
import { ERROR_TYPE } from "nestjs-rmq/dist/constants";
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
import { TypeOfServiceEntity } from "../../common/entities/type-of-service.entity";

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

        await this.generalMeterRepository.saveGeneralMeters(generalMeters);
        await this.individualMeterRepository.saveIndividualMeters(individualMeters);

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
        let meter: GeneralMeterEntity | IndividualMeterEntity;
        let gettedMeter: Omit<IGeneralMeter | IIndividualMeter, 'id'>;
        switch (meterType) {
            case (MeterType.General):
                meter = await this.generalMeterRepository.findGeneralMeterById(id);
                if (!meter) {
                    throw new RMQError(METER_NOT_EXIST, ERROR_TYPE.RMQ, HttpStatus.NOT_FOUND);
                }
                gettedMeter = new GeneralMeterEntity(meter).getGeneralMeter();
                return { gettedMeter };
            case (MeterType.Individual):
                meter = await this.individualMeterRepository.findIndividualMeterById(id);
                if (!meter) {
                    throw new RMQError(METER_NOT_EXIST, ERROR_TYPE.RMQ, HttpStatus.NOT_FOUND);
                }
                gettedMeter = new IndividualMeterEntity(meter).getIndividualMeter();
                return { gettedMeter };
            default:
                throw new RMQError(INCORRECT_METER_TYPE, ERROR_TYPE.RMQ, HttpStatus.CONFLICT);
        }

    }

    public async addMeter(dto: ReferenceAddMeter.Request) {
        let apartment: ApartmentEntity;
        let house: HouseEntity;
        let typeOfService: TypeOfServiceEntity;
        let existedMeter: Meters,
            newMeter: Meters,
            newMeterEntity: Meters;
        switch (dto.meterType) {
            case (MeterType.General):
                house = await this.houseRepository.findHouseById(dto.houseId);
                if (!house) {
                    throw new RMQError(HOME_NOT_EXIST, ERROR_TYPE.RMQ, HttpStatus.NOT_FOUND);
                }
                typeOfService = await this.typeOfServicesRepository.findTypeOfServiceById(dto.typeOfServiceId);
                if (!typeOfService) {
                    throw new RMQError(TYPE_OF_SERVICE_NOT_EXIST, ERROR_TYPE.RMQ, HttpStatus.NOT_FOUND);
                }
                existedMeter = await this.generalMeterRepository.findIndividualMeterByFNumber(dto.factoryNumber);
                if (existedMeter) {
                    throw new RMQError(METER_ALREADY_EXIST, ERROR_TYPE.RMQ, HttpStatus.CONFLICT);
                }
                newMeterEntity = new GeneralMeterEntity({
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
                typeOfService = await this.typeOfServicesRepository.findTypeOfServiceById(dto.typeOfServiceId);
                if (!typeOfService) {
                    throw new RMQError(TYPE_OF_SERVICE_NOT_EXIST, ERROR_TYPE.RMQ, HttpStatus.NOT_FOUND);
                }
                existedMeter = await this.individualMeterRepository.findIndividualMeterByFNumber(dto.factoryNumber);
                if (existedMeter) {
                    throw new RMQError(METER_ALREADY_EXIST, ERROR_TYPE.RMQ, HttpStatus.CONFLICT);
                }
                newMeterEntity = new IndividualMeterEntity({
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
        let existedMeter: Meters, meterEntity: Promise<GeneralMeterEntity> | Promise<IndividualMeterEntity>;

        switch (meterType) {
            case (MeterType.General):
                existedMeter = await this.generalMeterRepository.findGeneralMeterById(id);
                if (!existedMeter) {
                    throw new RMQError(METER_NOT_EXIST, ERROR_TYPE.RMQ, HttpStatus.NOT_FOUND);
                }
                meterEntity = new GeneralMeterEntity(existedMeter).updateGeneralMeter(verifiedAt);
                return Promise.all([
                    this.generalMeterRepository.updateGeneralMeter(await meterEntity),
                ]);
            case (MeterType.Individual):
                existedMeter = await this.individualMeterRepository.findIndividualMeterById(id);
                if (!existedMeter) {
                    throw new RMQError(METER_NOT_EXIST, ERROR_TYPE.RMQ, HttpStatus.NOT_FOUND);
                }
                meterEntity = new IndividualMeterEntity(existedMeter).updateIndividualMeter(verifiedAt);
                return Promise.all([
                    this.individualMeterRepository.updateIndividualMeter(await meterEntity),
                ]);
            default:
                throw new RMQError(INCORRECT_METER_TYPE, ERROR_TYPE.RMQ, HttpStatus.CONFLICT);
        }
    }
}