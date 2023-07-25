import { METER_READING_NOT_EXIST, INCORRECT_METER_TYPE, METER_NOT_EXIST } from "@myhome/constants";
import { IGeneralMeterReading, IIndividualMeterReading, MeterType } from "@myhome/interfaces";
import { HttpStatus, Injectable } from "@nestjs/common";
import { RMQError } from "nestjs-rmq";
import { ERROR_TYPE } from "nestjs-rmq/dist/constants";
import { ReferenceAddMeterReading } from "@myhome/contracts";
import { GeneralMeterReadingEnitity } from "../entities/general-meter-reading.entity";
import { IndividualMeterReadingEnitity } from "../entities/individual-meter-reading.entity";
import { GeneralMeterReadingRepository } from "../repositories/general-meter-reading.repository";
import { IndividualMeterReadingRepository } from "../repositories/individual-meter-reading.repository";
import { IndividualMeterRepository } from "../repositories/individual-meter.repository";
import { GeneralMeterRepository } from "../repositories/general-meter.repository";
import { Meters } from "./meter.service";

type MeterReadings = IndividualMeterReadingEnitity | GeneralMeterReadingEnitity;

@Injectable()
export class MeterReadingService {
    constructor(
        private readonly individualMeterReadingRepository: IndividualMeterReadingRepository,
        private readonly generalMeterReadingRepository: GeneralMeterReadingRepository,
        private readonly individualMeterRepository: IndividualMeterRepository,
        private readonly generalMeterRepository: GeneralMeterRepository,
    ) { }

    public async getMeterReading(id: number, meterType: MeterType) {
        let meterReading: GeneralMeterReadingEnitity | IndividualMeterReadingEnitity;
        let gettedMeterReading: Omit<IGeneralMeterReading | IIndividualMeterReading, 'id'>;
        switch (meterType) {
            case (MeterType.General):
                meterReading = await this.generalMeterReadingRepository.findGeneralMeterReadingById(id);
                if (!meterReading) {
                    throw new RMQError(METER_READING_NOT_EXIST, ERROR_TYPE.RMQ, HttpStatus.NOT_FOUND);
                }
                gettedMeterReading = new GeneralMeterReadingEnitity(meterReading).getGeneralMeterReading();
                return { gettedMeterReading };
            case (MeterType.Individual):
                meterReading = await this.individualMeterReadingRepository.findIndividualMeterReadingById(id);
                if (!meterReading) {
                    throw new RMQError(METER_READING_NOT_EXIST, ERROR_TYPE.RMQ, HttpStatus.NOT_FOUND);
                }
                gettedMeterReading = new IndividualMeterReadingEnitity(meterReading).getIndividualMeterReading();
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
                newMeterReadingEntity = new GeneralMeterReadingEnitity({
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
                newMeterReadingEntity = new IndividualMeterReadingEnitity({
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
}