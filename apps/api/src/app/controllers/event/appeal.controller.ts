import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { EventAddAppeal } from '@myhome/contracts';
import { RMQService } from 'nestjs-rmq';
import { CatchError } from '../../error.filter';
import { AddAppealDto } from '../../dtos/event/appeal.dto';

@Controller('appeal')
export class AppealController {
    constructor(private readonly rmqService: RMQService) { }

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
