import { ReferenceAddSubscriber, ReferenceUpdateSubscriber } from '@myhome/contracts';
import { Body, Controller } from '@nestjs/common';
import { RMQValidate, RMQRoute, RMQError } from 'nestjs-rmq';
import { ERROR_TYPE } from 'nestjs-rmq/dist/constants';
import { SubscriberService } from '../services/subscriber.service';

@Controller()
export class SubscriberCommands {
    constructor(
        private readonly subscriberService: SubscriberService
    ) { }

    @RMQValidate()
    @RMQRoute(ReferenceAddSubscriber.topic)
    async addSubscriber(@Body() dto: ReferenceAddSubscriber.Request) {
        try {
            return await this.subscriberService.addSubscriber(dto);
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
