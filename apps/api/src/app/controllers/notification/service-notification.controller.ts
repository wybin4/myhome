import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { UpdateServiceNotification, GetServiceNotifications, GetServiceNotification } from '@myhome/contracts';
import { RMQRoute, RMQService, RMQValidate } from 'nestjs-rmq';
import { CatchError } from '../../error.filter';
import { UpdateServiceNotificationDto, GetServiceNotificationsDto } from '../../dtos/notification/service-notification.dto';
import { ServiceNotificationGateway } from '../../service-notification.gateway';

@Controller('service-notification')
export class ServiceNotificationController {
    constructor(
        private readonly rmqService: RMQService,
        private readonly notificationGateway: ServiceNotificationGateway
    ) { }

    @HttpCode(200)
    @Post('get-service-notifications')
    async getNotifications(@Body() dto: GetServiceNotificationsDto) {
        try {
            return await this.rmqService.send<
                GetServiceNotifications.Request,
                GetServiceNotifications.Response
            >(GetServiceNotifications.topic, dto);
        } catch (e) {
            CatchError(e);
        }
    }

    @HttpCode(200)
    @Post('update-service-notification')
    async updateNotification(@Body() dto: UpdateServiceNotificationDto) {
        try {
            return await this.rmqService.send<
                UpdateServiceNotification.Request,
                UpdateServiceNotification.Response
            >(UpdateServiceNotification.topic, dto);
        } catch (e) {
            CatchError(e);
        }
    }

    @RMQValidate()
    @RMQRoute(GetServiceNotification.topic)
    async getNotification(@Body() dto: GetServiceNotification.Request) {
        this.notificationGateway.sendNotificationToClients(dto.notification);
    }

}
