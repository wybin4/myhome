import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { EventAddHouseNotification, EventGetHouseNotification, EventGetHouseNotificationsByMCId } from '@myhome/contracts';
import { RMQService } from 'nestjs-rmq';
import { CatchError } from '../../../error.filter';
import { AddHouseNotificationDto, GetHouseNotificationDto, GetHouseNotificationsByMCIdDto } from '../../../dtos/event/notification/house-notification.dto';

@Controller('house-notification')
export class HouseNotificationController {
    constructor(private readonly rmqService: RMQService) { }

    @HttpCode(200)
    @Post('get-house-notifications-by-mcid')
    async getNotificationsByMCId(@Body() dto: GetHouseNotificationsByMCIdDto) {
        try {
            return await this.rmqService.send<
                EventGetHouseNotificationsByMCId.Request,
                EventGetHouseNotificationsByMCId.Response
            >(EventGetHouseNotificationsByMCId.topic, dto);
        } catch (e) {
            CatchError(e);
        }
    }

    @HttpCode(200)
    @Post('get-house-notification')
    async getNotification(@Body() dto: GetHouseNotificationDto) {
        try {
            return await this.rmqService.send<
                EventGetHouseNotification.Request,
                EventGetHouseNotification.Response
            >(EventGetHouseNotification.topic, dto);
        } catch (e) {
            CatchError(e);
        }
    }

    @HttpCode(201)
    @Post('add-house-notification')
    async addNotification(@Body() dto: AddHouseNotificationDto) {
        try {
            return await this.rmqService.send<
                EventAddHouseNotification.Request,
                EventAddHouseNotification.Response
            >(EventAddHouseNotification.topic, dto);
        } catch (e) {
            CatchError(e);
        }
    }

}
