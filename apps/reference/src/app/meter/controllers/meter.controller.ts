import { Body, Controller } from '@nestjs/common';
import { RMQError, RMQRoute, RMQValidate } from 'nestjs-rmq';
import { ReferenceAddMeter, ReferenceGetMeter, ReferenceGetMetersAllInfoBySID, ReferenceGetMetersByMCId, ReferenceUpdateMeter } from '@myhome/contracts';
import { MeterService } from '../services/meter.service';
import { ERROR_TYPE } from 'nestjs-rmq/dist/constants';

@Controller()
export class MeterController {
    constructor(
        private readonly meterService: MeterService
    ) { }

    @RMQValidate()
    @RMQRoute(ReferenceGetMetersAllInfoBySID.topic)
    async getMetersAllInfoBySID(@Body() { subscriberIds }: ReferenceGetMetersAllInfoBySID.Request) {
        try {
            return this.meterService.getMetersAllInfoBySID(subscriberIds);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }

    @RMQValidate()
    @RMQRoute(ReferenceGetMeter.topic)
    async getMeter(@Body() { id, meterType }: ReferenceGetMeter.Request) {
        try {
            return this.meterService.getMeter(id, meterType);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }

    @RMQValidate()
    @RMQRoute(ReferenceGetMetersByMCId.topic)
    async getMetersByMCId(@Body() { managementCompanyId, meterType }: ReferenceGetMetersByMCId.Request) {
        try {
            return this.meterService.getMetersByMCId(managementCompanyId, meterType);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }

    @RMQValidate()
    @RMQRoute(ReferenceAddMeter.topic)
    async addMeter(@Body() dto: ReferenceAddMeter.Request) {
        try {
            return this.meterService.addMeter(dto);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }


    @RMQValidate()
    @RMQRoute(ReferenceUpdateMeter.topic)
    async updateMeter(@Body() { id, verifiedAt, meterType }: ReferenceUpdateMeter.Request) {
        try {
            return this.meterService.updateMeter(id, new Date(verifiedAt), meterType);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }

}
