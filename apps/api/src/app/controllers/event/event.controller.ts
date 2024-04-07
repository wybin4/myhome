import { Body, Controller, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { RMQService } from 'nestjs-rmq';
import { CatchError } from '../../error.filter';
import { GetEventsDto } from '../../dtos/event/event.dto';
import { EventGetEvents } from '@myhome/contracts';
import { JWTAuthGuard } from '../../guards/jwt.guard';
import { IJWTPayload } from '@myhome/interfaces';

@Controller('event')
export class EventController {
    constructor(private readonly rmqService: RMQService) { }

    @UseGuards(JWTAuthGuard)
    @HttpCode(200)
    @Post('get-events')
    async getEvents(
        @Req() req: { user: IJWTPayload },
        @Body() dto: GetEventsDto
    ) {
        try {
            return await this.rmqService.send<
                EventGetEvents.Request,
                EventGetEvents.Response
            >(EventGetEvents.topic, { ...dto, ...req.user });
        } catch (e) {
            CatchError(e);
        }
    }

}
