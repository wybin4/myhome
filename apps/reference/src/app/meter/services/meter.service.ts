import { METER_NOT_EXIST, INCORRECT_METER_TYPE, APART_NOT_EXIST, METER_ALREADY_EXIST, HOME_NOT_EXIST } from "@myhome/constants";
import { IGeneralMeter, IIndividualMeter, MeterType } from "@myhome/interfaces";
import { HttpStatus, Injectable } from "@nestjs/common";
import { RMQError, RMQService } from "nestjs-rmq";
import { ERROR_TYPE } from "nestjs-rmq/dist/constants";
import { GeneralMeters } from "../entities/general-meter.entity";
import { IndividualMeters } from "../entities/individual-meter.entity";
import { GeneralMeterRepository } from "../repositories/general-meter.repository";
import { IndividualMeterRepository } from "../repositories/individual-meter.repository";
import { ReferenceAddMeter } from "@myhome/contracts";
import { ApartmentRepository } from "../../subscriber/repositories/apartment.repository";
import { HouseRepository } from "../../subscriber/repositories/house.repository";
import { Apartments } from "../../subscriber/entities/apartment.entity";
import { Houses } from "../../subscriber/entities/house.entity";

type Meters = IndividualMeters | GeneralMeters;

@Injectable()
export class MeterService {
    constructor(
        private readonly individualMeterRepository: IndividualMeterRepository,
        private readonly generalMeterRepository: GeneralMeterRepository,
        private readonly rmqService: RMQService,
        private readonly apartmentRepository: ApartmentRepository,
        private readonly houseRepository: HouseRepository,
    ) { }

    public async getMeter(id: number, meterType: MeterType) {
        let meter: GeneralMeters | IndividualMeters;
        let gettedMeter: Omit<IGeneralMeter | IIndividualMeter, 'id'>;
        switch (meterType) {
            case (MeterType.General):
                meter = await this.generalMeterRepository.findGeneralMeterById(id);
                if (!meter) {
                    throw new RMQError(METER_NOT_EXIST, ERROR_TYPE.RMQ, HttpStatus.NOT_FOUND);
                }
                gettedMeter = new GeneralMeters(meter).getGeneralMeter();
                return { gettedMeter };
            case (MeterType.Individual):
                meter = await this.individualMeterRepository.findIndividualMeterById(id);
                if (!meter) {
                    throw new RMQError(METER_NOT_EXIST, ERROR_TYPE.RMQ, HttpStatus.NOT_FOUND);
                }
                gettedMeter = new IndividualMeters(meter).getIndividualMeter();
                return { gettedMeter };
            default:
                throw new RMQError(INCORRECT_METER_TYPE, ERROR_TYPE.RMQ, HttpStatus.CONFLICT);
        }

    }

    public async addMeter(dto: ReferenceAddMeter.Request) {
        let apartment: Apartments;
        let house: Houses;
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
                newMeterEntity = new GeneralMeters(dto);
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
                newMeterEntity = new IndividualMeters(dto);
                newMeter = await this.individualMeterRepository.createIndividualMeter(newMeterEntity);
                return { newMeter };
            default:
                throw new RMQError(INCORRECT_METER_TYPE, ERROR_TYPE.RMQ, HttpStatus.CONFLICT);
        }
    }

    public async updateMeter(id: number, verifiedAt: Date, meterType: MeterType) {
        let existedMeter: Meters, meterEntity: Promise<GeneralMeters> | Promise<IndividualMeters>;

        switch (meterType) {
            case (MeterType.General):
                existedMeter = await this.generalMeterRepository.findGeneralMeterById(id);
                if (!existedMeter) {
                    throw new RMQError(METER_NOT_EXIST, ERROR_TYPE.RMQ, HttpStatus.NOT_FOUND);
                }
                meterEntity = new GeneralMeters(existedMeter).updateGeneralMeter(verifiedAt);
                return Promise.all([
                    this.generalMeterRepository.updateGeneralMeter(await meterEntity),
                ]);
            case (MeterType.Individual):
                existedMeter = await this.individualMeterRepository.findIndividualMeterById(id);
                if (!existedMeter) {
                    throw new RMQError(METER_NOT_EXIST, ERROR_TYPE.RMQ, HttpStatus.NOT_FOUND);
                }
                meterEntity = new IndividualMeters(existedMeter).updateIndividualMeter(verifiedAt);
                return Promise.all([
                    this.individualMeterRepository.updateIndividualMeter(await meterEntity),
                ]);
            default:
                throw new RMQError(INCORRECT_METER_TYPE, ERROR_TYPE.RMQ, HttpStatus.CONFLICT);
        }
    }
}