import { Body, Controller } from '@nestjs/common';
import { RMQError, RMQRoute, RMQValidate } from 'nestjs-rmq';
import { ERROR_TYPE } from 'nestjs-rmq/dist/constants';
import { ReferenceAddMeterReading } from '@myhome/contracts';
import { MeterReadingCommandsService } from '../services/meter-reading.commands.service';

@Controller()
export class MeterReadingCommands {
    constructor(
        private readonly meterReadingCommandsService: MeterReadingCommandsService
    ) { }

    @RMQValidate()
    @RMQRoute(ReferenceAddMeterReading.topic)
    async addMeterReading(@Body() dto: ReferenceAddMeterReading.Request) {
        try {
            return await this.meterReadingCommandsService.addMeterReading(dto);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }
}
