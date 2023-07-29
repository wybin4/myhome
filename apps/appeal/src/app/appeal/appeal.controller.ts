import { Body, Controller } from '@nestjs/common';
import { RMQRoute, RMQValidate } from 'nestjs-rmq';
import { AppealAddAppeal, AppealGetAppeal } from '@myhome/contracts';
import { AppealService } from './appeal.service';

@Controller()
export class AppealController {
    constructor(
        private readonly appealService: AppealService
    ) { }

    @RMQValidate()
    @RMQRoute(AppealGetAppeal.topic)
    async getAppeal(@Body() { id }: AppealGetAppeal.Request) {
        return this.appealService.getAppeal(id);
    }

    @RMQValidate()
    @RMQRoute(AppealAddAppeal.topic)
    async addAppeal(@Body() dto: AppealAddAppeal.Request) {
        return this.appealService.addAppeal(dto);
    }
}
