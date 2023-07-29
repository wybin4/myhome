import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { GetNotification, ReadNotification } from '@myhome/contracts';
import { RMQService } from 'nestjs-rmq';
import { CatchError } from '../../error.filter';
import { GetNotificationDto, ReadNotificationDto } from '../../dtos/notification/notification.dto';

@Controller('notification')
export class NotificationController {
    constructor(private readonly rmqService: RMQService) { }

    @HttpCode(200)
    @Post('get-notification')
    async getNotification(@Body() dto: GetNotificationDto) {
        try {
            return await this.rmqService.send<
                GetNotification.Request,
                GetNotification.Response
            >(GetNotification.topic, dto);
        } catch (e) {
            CatchError(e);
        }
    }

    @HttpCode(200)
    @Post('read-notification')
    async readNotification(@Body() dto: ReadNotificationDto) {
        try {
            return await this.rmqService.send<
                ReadNotification.Request,
                ReadNotification.Response
            >(ReadNotification.topic, dto);
        } catch (e) {
            CatchError(e);
        }
    }

}
