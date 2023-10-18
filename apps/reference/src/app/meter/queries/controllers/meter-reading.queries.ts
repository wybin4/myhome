import { Body, Controller } from '@nestjs/common';
import { RMQError, RMQRoute, RMQValidate } from 'nestjs-rmq';
import { ERROR_TYPE } from 'nestjs-rmq/dist/constants';
import { ReferenceGetMeterReading, ReferenceGetIndividualMeterReadings, ReferenceGetMeterReadingByHID } from '@myhome/contracts';
import { MeterReadingQueriesService } from '../services/meter-reading.queries.service';


@Controller()
export class MeterReadingQueries {
    constructor(
        private readonly meterReadingQueriesService: MeterReadingQueriesService
    ) { }

    @RMQValidate()
    @RMQRoute(ReferenceGetMeterReading.topic)
    async getMeterReading(@Body() { id, meterType }: ReferenceGetMeterReading.Request) {
        try {
            return await this.meterReadingQueriesService.getMeterReading(id, meterType);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }

    @RMQValidate()
    @RMQRoute(ReferenceGetIndividualMeterReadings.topic)
    async getIndividualMeterReadings(@Body() dto: ReferenceGetIndividualMeterReadings.Request) {
        try {
            return await this.meterReadingQueriesService.getIndividualMeterReadings(dto);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }

    @RMQValidate()
    @RMQRoute(ReferenceGetMeterReadingByHID.topic)
    async getMeterReadingsByHID(@Body() dto: ReferenceGetMeterReadingByHID.Request) {
        try {
            return await this.meterReadingQueriesService.getMeterReadingsByHID(dto);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }

}
