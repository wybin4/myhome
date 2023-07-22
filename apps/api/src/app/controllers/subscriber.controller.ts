import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ReferenceAddSubscriber, ReferenceGetSubscriber, ReferenceUpdateSubscriber } from '@myhome/contracts';
import { RMQService } from 'nestjs-rmq';
import { GetSubscriberDto, AddSubscriberDto, UpdateSubscriberDto } from '../dtos/subscriber.dto';
import { CatchError } from '../error.filter';

@Controller('subscriber')
export class SubscriberController {
    constructor(private readonly rmqService: RMQService) { }

    @HttpCode(200)
    @Post('get-subscriber')
    async getSubscriber(@Body() dto: GetSubscriberDto) {
        try {
            return await this.rmqService.send<
                ReferenceGetSubscriber.Request,
                ReferenceGetSubscriber.Response
            >(ReferenceGetSubscriber.topic, dto);
        } catch (e) {
            CatchError(e);
        }
    }

    @HttpCode(201)
    @Post('add-subscriber')
    async addSubscriber(@Body() dto: AddSubscriberDto) {
        try {
            return await this.rmqService.send<
                ReferenceAddSubscriber.Request,
                ReferenceAddSubscriber.Response
            >(ReferenceAddSubscriber.topic, dto);
        } catch (e) {
            CatchError(e);
        }
    }

    @HttpCode(200)
    @Post('update-subscriber')
    async updateSubscriber(@Body() dto: UpdateSubscriberDto) {
        try {
            return await this.rmqService.send<
                ReferenceUpdateSubscriber.Request,
                ReferenceUpdateSubscriber.Response
            >(ReferenceUpdateSubscriber.topic, dto);
        } catch (e) {
            CatchError(e);
        }
    }

}
