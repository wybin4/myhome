import { Body, Controller } from '@nestjs/common';
import { RMQError, RMQRoute, RMQValidate } from 'nestjs-rmq';
import { AppealAddAppeal, AppealGetAppeal, AppealGetAppealsByMCId } from '@myhome/contracts';
import { AppealService } from './appeal.service';
import { ERROR_TYPE } from 'nestjs-rmq/dist/constants';

@Controller()
export class AppealController {
    constructor(
        private readonly appealService: AppealService
    ) { }

    @RMQValidate()
    @RMQRoute(AppealGetAppealsByMCId.topic)
    async getAppealsByMCId(@Body() { managementCompanyId }: AppealGetAppealsByMCId.Request) {
        try {
            return this.appealService.getAppealsByMCId(managementCompanyId);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.code);
        }
    }

    @RMQValidate()
    @RMQRoute(AppealGetAppeal.topic)
    async getAppeal(@Body() { id }: AppealGetAppeal.Request) {
        try {
            return this.appealService.getAppeal(id);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.code);
        }
    }

    @RMQValidate()
    @RMQRoute(AppealAddAppeal.topic)
    async addAppeal(@Body() dto: AppealAddAppeal.Request) {
        try {
            return this.appealService.addAppeal(dto);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.code);
        }
    }
}
