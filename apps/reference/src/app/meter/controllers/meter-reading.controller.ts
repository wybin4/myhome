import { Body, Controller } from '@nestjs/common';
import { RMQRoute, RMQValidate } from 'nestjs-rmq';
import { ReferenceAddMeterReading, ReferenceGetMeterReading } from '@myhome/contracts';
import { MeterReadingService } from '../services/meter-reading.service';
import { ReferenceGetMeterReadingByHID, ReferenceGetMeterReadingBySID } from '@myhome/contracts';

@Controller('meter-reading')
export class MeterReadingController {
    constructor(
        private readonly meterReadingService: MeterReadingService
    ) { }

    @RMQValidate()
    @RMQRoute(ReferenceGetMeterReading.topic)
    async getMeterReading(@Body() { id, meterType }: ReferenceGetMeterReading.Request) {
        return this.meterReadingService.getMeterReading(id, meterType);
    }

    @RMQValidate()
    @RMQRoute(ReferenceAddMeterReading.topic)
    async addMeterReading(@Body() dto: ReferenceAddMeterReading.Request) {
        return this.meterReadingService.addMeterReading(dto);
    }

    @RMQValidate()
    @RMQRoute(ReferenceGetMeterReadingBySID.topic)
    async getMeterReadingBySID(@Body() dto: ReferenceGetMeterReadingBySID.Request) {
        return this.meterReadingService.getMeterReadingBySID(dto);
    }

    @RMQValidate()
    @RMQRoute(ReferenceGetMeterReadingByHID.topic)
    async getMeterReadingByHID(@Body() dto: ReferenceGetMeterReadingByHID.Request) {
        return this.meterReadingService.getMeterReadingByHID(dto);
    }
}
