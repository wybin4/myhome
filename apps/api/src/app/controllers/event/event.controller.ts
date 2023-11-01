import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { RMQService } from 'nestjs-rmq';
import { CatchError } from '../../error.filter';
import { GetEventsDto } from '../../dtos/event/event.dto';
import { EventGetEvents } from '@myhome/contracts';

@Controller('event')
export class EventController {
    constructor(private readonly rmqService: RMQService) { }

    @HttpCode(200)
    @Post('get-events')
    async getEvents(@Body() dto: GetEventsDto) {
        try {
            return await this.rmqService.send<
                EventGetEvents.Request,
                EventGetEvents.Response
            >(EventGetEvents.topic, dto);
        } catch (e) {
            CatchError(e);
        }
    }

}
