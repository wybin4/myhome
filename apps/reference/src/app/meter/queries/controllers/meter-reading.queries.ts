import { Body, Controller } from '@nestjs/common';
import { RMQError, RMQRoute, RMQValidate } from 'nestjs-rmq';
import { ERROR_TYPE } from 'nestjs-rmq/dist/constants';
import { ReferenceGetIndividualMeterReadings, ReferenceGetMeterReadingsByHID } from '@myhome/contracts';
import { MeterReadingQueriesService } from '../services/meter-reading.queries.service';


@Controller()
export class MeterReadingQueries {
    constructor(
        private readonly meterReadingQueriesService: MeterReadingQueriesService
    ) { }

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
    @RMQRoute(ReferenceGetMeterReadingsByHID.topic)
    async getMeterReadingsByHID(@Body() dto: ReferenceGetMeterReadingsByHID.Request) {
        try {
            return await this.meterReadingQueriesService.getMeterReadingsByHID(dto);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }

}
