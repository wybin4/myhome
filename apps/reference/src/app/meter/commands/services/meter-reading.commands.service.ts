import { IGeneralMeterReading, MeterType, } from "@myhome/interfaces";
import { HttpStatus, Injectable } from "@nestjs/common";
import { ReferenceAddMeterReading, } from "@myhome/contracts";
import { GeneralMeterReadingEntity } from "../../entities/general-meter-reading.entity";
import { IndividualMeterReadingEntity } from "../../entities/individual-meter-reading.entity";
import { GeneralMeterReadingRepository } from "../../repositories/general-meter-reading.repository";
import { IndividualMeterReadingRepository } from "../../repositories/individual-meter-reading.repository";
import { IndividualMeterRepository } from "../../repositories/individual-meter.repository";
import { GeneralMeterRepository } from "../../repositories/general-meter.repository";
import { RMQException, METER_NOT_EXIST, addGenericObject, INCORRECT_METER_TYPE } from "@myhome/constants";
import { Meters } from "./meter.commands.service";

@Injectable()
export class MeterReadingCommandsService {
    constructor(
        private readonly individualMeterReadingRepository: IndividualMeterReadingRepository,
        private readonly generalMeterReadingRepository: GeneralMeterReadingRepository,
        private readonly individualMeterRepository: IndividualMeterRepository,
        private readonly generalMeterRepository: GeneralMeterRepository,
    ) { }

    public async addMeterReading(dto: ReferenceAddMeterReading.Request) {
        let meter: Meters;
        switch (dto.meterType) {
            case (MeterType.General):
                meter = await this.generalMeterRepository.findById(dto.meterId);
                if (!meter) {
                    throw new RMQException(METER_NOT_EXIST.message(dto.meterId), METER_NOT_EXIST.status);
                }
                return await addGenericObject<GeneralMeterReadingEntity>
                    (
                        this.generalMeterReadingRepository,
                        (item) => new GeneralMeterReadingEntity(item),
                        {
                            generalMeterId: dto.meterId,
                            reading: dto.reading,
                            readAt: new Date(dto.readAt)
                        } as IGeneralMeterReading
                    );
            case (MeterType.Individual):
                meter = await this.individualMeterRepository.findById(dto.meterId);
                if (!meter) {
                    throw new RMQException(METER_NOT_EXIST.message(dto.meterId), METER_NOT_EXIST.status);
                }
                return await addGenericObject<IndividualMeterReadingEntity>
                    (
                        this.individualMeterReadingRepository,
                        (item) => new IndividualMeterReadingEntity(item),
                        {
                            individualMeterId: dto.meterId,
                            reading: dto.reading,
                            readAt: new Date(dto.readAt)
                        } as IndividualMeterReadingEntity
                    );
            default:
                throw new RMQException(INCORRECT_METER_TYPE, HttpStatus.CONFLICT);
        }
    }
}