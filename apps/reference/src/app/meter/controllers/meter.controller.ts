import { Body, Controller } from '@nestjs/common';
import { RMQRoute, RMQValidate } from 'nestjs-rmq';
import { ReferenceAddMeter, ReferenceGetMeter, ReferenceUpdateMeter } from '@myhome/contracts';
import { MeterService } from '../services/meter.service';

@Controller()
export class MeterController {
    constructor(
        private readonly meterService: MeterService
    ) { }

    @RMQValidate()
    @RMQRoute(ReferenceGetMeter.topic)
    async getMeter(@Body() { id, meterType }: ReferenceGetMeter.Request) {
        return this.meterService.getMeter(id, meterType);
    }

    @RMQValidate()
    @RMQRoute(ReferenceAddMeter.topic)
    async addMeter(@Body() dto: ReferenceAddMeter.Request) {
        return this.meterService.addMeter(dto);
    }


    @RMQValidate()
    @RMQRoute(ReferenceUpdateMeter.topic)
    async updateMeter(@Body() { id, verifiedAt, meterType }: ReferenceUpdateMeter.Request) {
        return this.meterService.updateMeter(id, verifiedAt, meterType);
    }

}
