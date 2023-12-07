import { ReferenceAddSubscribers, ReferenceUpdateSubscriber } from '@myhome/contracts';
import { Body, Controller } from '@nestjs/common';
import { RMQValidate, RMQRoute, RMQError } from 'nestjs-rmq';
import { ERROR_TYPE } from 'nestjs-rmq/dist/constants';
import { SubscriberService } from '../services/subscriber.service';

@Controller('subscriber')
export class SubscriberCommands {
    constructor(
        private readonly subscriberService: SubscriberService
    ) { }

    @RMQValidate()
    @RMQRoute(ReferenceAddSubscribers.topic)
    async addSubscribers(@Body() dto: ReferenceAddSubscribers.Request) {
        try {
            return await this.subscriberService.addSubscribers(dto);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }

    @RMQValidate()
    @RMQRoute(ReferenceUpdateSubscriber.topic)
    async archieveSubscriber(@Body() { id }: ReferenceUpdateSubscriber.Request) {
        try {
            return await this.subscriberService.archieveSubscriber(id);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
        }
    }
}
