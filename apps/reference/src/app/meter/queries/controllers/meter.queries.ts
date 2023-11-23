import { Body, Controller } from '@nestjs/common';
import { RMQError, RMQRoute, RMQValidate } from 'nestjs-rmq';
import { ReferenceGetMeters, ReferenceGetMetersByUser } from '@myhome/contracts';
import { ERROR_TYPE } from 'nestjs-rmq/dist/constants';
import { MeterQueriesService } from '../services/meter.queries.service';

@Controller("meter-readings")
export class MeterQueries {
    constructor(
        private readonly meterQueriesService: MeterQueriesService
    ) { }

    @RMQValidate()
    @RMQRoute(ReferenceGetMeters.topic)
    async getMeters(@Body() { ids, meterType }: ReferenceGetMeters.Request) {
        try {
            return await this.meterQueriesService.getMeters(ids, meterType);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }

    @RMQValidate()
    @RMQRoute(ReferenceGetMetersByUser.topic)
    async getMetersByMCId(@Body() dto: ReferenceGetMetersByUser.Request) {
        try {
            return await this.meterQueriesService.getMetersByUser(dto);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }

}
