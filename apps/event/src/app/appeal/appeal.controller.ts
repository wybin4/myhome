import { Body, Controller } from '@nestjs/common';
import { RMQError, RMQRoute, RMQValidate } from 'nestjs-rmq';
import { EventAddAppeal, EventUpdateAppeal } from '@myhome/contracts';
import { AppealService } from './appeal.service';
import { ERROR_TYPE } from 'nestjs-rmq/dist/constants';

@Controller("appeal")
export class AppealController {
    constructor(
        private readonly appealService: AppealService
    ) { }

    @RMQValidate()
    @RMQRoute(EventAddAppeal.topic)
    async addAppeal(@Body() dto: EventAddAppeal.Request): Promise<EventAddAppeal.Response> {
        try {
            return await this.appealService.addAppeal(dto);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }

    @RMQValidate()
    @RMQRoute(EventUpdateAppeal.topic)
    async updateAppeal(@Body() dto: EventUpdateAppeal.Request): Promise<EventUpdateAppeal.Response> {
        try {
            return await this.appealService.updateAppeal(dto);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }
}
