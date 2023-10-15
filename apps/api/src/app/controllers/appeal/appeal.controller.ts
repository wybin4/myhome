import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AppealAddAppeal, AppealGetAppeal, AppealGetAppealsByMCId } from '@myhome/contracts';
import { RMQService } from 'nestjs-rmq';
import { CatchError } from '../../error.filter';
import { AddAppealDto, GetAppealDto, GetAppealsByMCIdDto } from '../../dtos/appeal/appeal.dto';

@Controller('appeal')
export class AppealController {
    constructor(private readonly rmqService: RMQService) { }

    @HttpCode(200)
    @Post('get-appeals-by-mcid')
    async getAppealsByMCId(@Body() dto: GetAppealsByMCIdDto) {
        try {
            return await this.rmqService.send<
                AppealGetAppealsByMCId.Request,
                AppealGetAppealsByMCId.Response
            >(AppealGetAppealsByMCId.topic, dto);
        } catch (e) {
            CatchError(e);
        }
    }

    @HttpCode(200)
    @Post('get-appeal')
    async getAppeal(@Body() dto: GetAppealDto) {
        try {
            return await this.rmqService.send<
                AppealGetAppeal.Request,
                AppealGetAppeal.Response
            >(AppealGetAppeal.topic, dto);
        } catch (e) {
            CatchError(e);
        }
    }

    @HttpCode(201)
    @Post('add-appeal')
    async addAppeal(@Body() dto: AddAppealDto) {
        try {
            return await this.rmqService.send<
                AppealAddAppeal.Request,
                AppealAddAppeal.Response
            >(AppealAddAppeal.topic, dto);
        } catch (e) {
            CatchError(e);
        }
    }

}
