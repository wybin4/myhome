import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AddHouseNotification, GetHouseNotification, GetHouseNotificationsByMCId } from '@myhome/contracts';
import { RMQService } from 'nestjs-rmq';
import { CatchError } from '../../error.filter';
import { AddHouseNotificationDto, GetHouseNotificationDto, GetHouseNotificationsByMCIdDto } from '../../dtos/notification/house-notification.dto';

@Controller('house-notification')
export class HouseNotificationController {
    constructor(private readonly rmqService: RMQService) { }

    @HttpCode(200)
    @Post('get-house-notifications-by-mcid')
    async getNotificationsByMCId(@Body() dto: GetHouseNotificationsByMCIdDto) {
        try {
            return await this.rmqService.send<
                GetHouseNotificationsByMCId.Request,
                GetHouseNotificationsByMCId.Response
            >(GetHouseNotificationsByMCId.topic, dto);
        } catch (e) {
            CatchError(e);
        }
    }

    @HttpCode(200)
    @Post('get-house-notification')
    async getNotification(@Body() dto: GetHouseNotificationDto) {
        try {
            return await this.rmqService.send<
                GetHouseNotification.Request,
                GetHouseNotification.Response
            >(GetHouseNotification.topic, dto);
        } catch (e) {
            CatchError(e);
        }
    }

    @HttpCode(201)
    @Post('add-house-notification')
    async addNotification(@Body() dto: AddHouseNotificationDto) {
        try {
            return await this.rmqService.send<
                AddHouseNotification.Request,
                AddHouseNotification.Response
            >(AddHouseNotification.topic, dto);
        } catch (e) {
            CatchError(e);
        }
    }

}
