import { Body, Controller } from '@nestjs/common';
import { RMQRoute, RMQValidate } from 'nestjs-rmq';
import { ReferenceAddMeterReading, ReferenceGetMeterReading } from '@myhome/contracts';
import { MeterReadingService } from '../services/meter-reading.service';

@Controller()
export class MeterReadingController {
    constructor(
        private readonly meterMeterReadingService: MeterReadingService
    ) { }

    @RMQValidate()
    @RMQRoute(ReferenceGetMeterReading.topic)
    async getMeterReading(@Body() { id, meterType }: ReferenceGetMeterReading.Request) {
        return this.meterMeterReadingService.getMeterReading(id, meterType);
    }

    @RMQValidate()
    @RMQRoute(ReferenceAddMeterReading.topic)
    async addMeterReading(@Body() dto: ReferenceAddMeterReading.Request) {
        return this.meterMeterReadingService.addMeterReading(dto);
    }
}
