import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { EventAddAppeal, EventGetAppeal, EventGetAppealsByMCId } from '@myhome/contracts';
import { RMQService } from 'nestjs-rmq';
import { CatchError } from '../../error.filter';
import { AddAppealDto, GetAppealDto, GetAppealsByMCIdDto } from '../../dtos/event/appeal.dto';

@Controller('appeal')
export class AppealController {
    constructor(private readonly rmqService: RMQService) { }

    @HttpCode(200)
    @Post('get-appeals-by-mcid')
    async getAppealsByMCId(@Body() dto: GetAppealsByMCIdDto) {
        try {
            return await this.rmqService.send<
                EventGetAppealsByMCId.Request,
                EventGetAppealsByMCId.Response
            >(EventGetAppealsByMCId.topic, dto);
        } catch (e) {
            CatchError(e);
        }
    }

    @HttpCode(200)
    @Post('get-appeal')
    async getAppeal(@Body() dto: GetAppealDto) {
        try {
            return await this.rmqService.send<
                EventGetAppeal.Request,
                EventGetAppeal.Response
            >(EventGetAppeal.topic, dto);
        } catch (e) {
            CatchError(e);
        }
    }

    @HttpCode(201)
    @Post('add-appeal')
    async addAppeal(@Body() dto: AddAppealDto) {
        try {
            return await this.rmqService.send<
                EventAddAppeal.Request,
                EventAddAppeal.Response
            >(EventAddAppeal.topic, dto);
        } catch (e) {
            CatchError(e);
        }
    }

}
