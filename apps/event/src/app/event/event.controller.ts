import { Body, Controller } from '@nestjs/common';
import { RMQError, RMQRoute, RMQValidate } from 'nestjs-rmq';
import { EventGetEvents } from '@myhome/contracts';
import { EventService } from './event.service';
import { ERROR_TYPE } from 'nestjs-rmq/dist/constants';

@Controller()
export class EventController {
    constructor(
        private readonly eventService: EventService
    ) { }

    @RMQValidate()
    @RMQRoute(EventGetEvents.topic)
    async getEvents(@Body() dto: EventGetEvents.Request) {
        try {
            return this.eventService.getEvents(dto);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }
}
