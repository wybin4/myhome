import { Body, Controller } from '@nestjs/common';
import { RMQError, RMQRoute, RMQValidate } from 'nestjs-rmq';
import { ReferenceAddMeters, ReferenceUpdateMeter } from '@myhome/contracts';
import { ERROR_TYPE } from 'nestjs-rmq/dist/constants';
import { MeterCommandsService } from '../services/meter.commands.service';

@Controller()
export class MeterCommands {
    constructor(
        private readonly meterCommandsService: MeterCommandsService
    ) { }

    @RMQValidate()
    @RMQRoute(ReferenceAddMeters.topic)
    async addMeters(@Body() dto: ReferenceAddMeters.Request) {
        try {
            return await this.meterCommandsService.addMeters(dto);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }

    @RMQValidate()
    @RMQRoute(ReferenceUpdateMeter.topic)
    async updateMeter(@Body() { id, verifiedAt, meterType }: ReferenceUpdateMeter.Request) {
        try {
            return await this.meterCommandsService.updateMeter(id, new Date(verifiedAt), meterType);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }

}
