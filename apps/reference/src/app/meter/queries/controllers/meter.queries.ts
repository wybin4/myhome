import { Body, Controller } from '@nestjs/common';
import { RMQError, RMQRoute, RMQValidate } from 'nestjs-rmq';
import { ReferenceGetMeters, ReferenceGetMetersBySID, ReferenceGetMetersByMCId } from '@myhome/contracts';
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
    @RMQRoute(ReferenceGetMetersByMCId.topic)
    async getMetersByMCId(@Body() { managementCompanyId, meterType }: ReferenceGetMetersByMCId.Request) {
        try {
            return await this.meterQueriesService.getMetersByMCId(managementCompanyId, meterType);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }

    @RMQValidate()
    @RMQRoute(ReferenceGetMetersBySID.topic)
    async getMetersBySID(@Body() { subscriberIds }: ReferenceGetMetersBySID.Request) {
        try {
            return await this.meterQueriesService.getMetersBySID(subscriberIds);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }

}
