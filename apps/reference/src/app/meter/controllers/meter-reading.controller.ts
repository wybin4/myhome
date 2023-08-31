import { Body, Controller } from '@nestjs/common';
import { RMQError, RMQRoute, RMQValidate } from 'nestjs-rmq';
import { ReferenceAddMeterReading, ReferenceGetMeterReading } from '@myhome/contracts';
import { MeterReadingService } from '../services/meter-reading.service';
import { ReferenceGetMeterReadingByHID, ReferenceGetMeterReadingBySID } from '@myhome/contracts';
import { ERROR_TYPE } from 'nestjs-rmq/dist/constants';

@Controller('meter-reading')
export class MeterReadingController {
    constructor(
        private readonly meterReadingService: MeterReadingService
    ) { }

    @RMQValidate()
    @RMQRoute(ReferenceGetMeterReading.topic)
    async getMeterReading(@Body() { id, meterType }: ReferenceGetMeterReading.Request) {
        try {
            return await this.meterReadingService.getMeterReading(id, meterType);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }

    @RMQValidate()
    @RMQRoute(ReferenceAddMeterReading.topic)
    async addMeterReading(@Body() dto: ReferenceAddMeterReading.Request) {
        try {
            return await this.meterReadingService.addMeterReading(dto);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }

    @RMQValidate()
    @RMQRoute(ReferenceGetMeterReadingBySID.topic)
    async getMeterReadingBySID(@Body() dto: ReferenceGetMeterReadingBySID.Request) {
        try {
            return await this.meterReadingService.getMeterReadingBySID(dto);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }

    @RMQValidate()
    @RMQRoute(ReferenceGetMeterReadingByHID.topic)
    async getMeterReadingByHID(@Body() dto: ReferenceGetMeterReadingByHID.Request) {
        try {
            return await this.meterReadingService.getMeterReadingByHID(dto);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }
}
