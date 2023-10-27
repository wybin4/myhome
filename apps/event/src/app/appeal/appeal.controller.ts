import { Body, Controller } from '@nestjs/common';
import { RMQError, RMQRoute, RMQValidate } from 'nestjs-rmq';
import { EventAddAppeal, EventGetAppeal, EventGetAppealsByMCId } from '@myhome/contracts';
import { AppealService } from './appeal.service';
import { ERROR_TYPE } from 'nestjs-rmq/dist/constants';

@Controller()
export class AppealController {
    constructor(
        private readonly appealService: AppealService
    ) { }

    @RMQValidate()
    @RMQRoute(EventGetAppealsByMCId.topic)
    async getAppealsByMCId(@Body() { managementCompanyId }: EventGetAppealsByMCId.Request) {
        try {
            return this.appealService.getAppealsByMCId(managementCompanyId);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.code);
        }
    }

    @RMQValidate()
    @RMQRoute(EventGetAppeal.topic)
    async getAppeal(@Body() { id }: EventGetAppeal.Request) {
        try {
            return this.appealService.getAppeal(id);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.code);
        }
    }

    @RMQValidate()
    @RMQRoute(EventAddAppeal.topic)
    async addAppeal(@Body() dto: EventAddAppeal.Request) {
        try {
            return this.appealService.addAppeal(dto);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.code);
        }
    }
}
