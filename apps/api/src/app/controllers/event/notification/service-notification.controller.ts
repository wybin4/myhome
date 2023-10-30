import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { EventUpdateServiceNotification, EventGetServiceNotifications, ApiEmitServiceNotifications, EventUpdateAllServiceNotifications } from '@myhome/contracts';
import { RMQRoute, RMQService, RMQValidate } from 'nestjs-rmq';
import { CatchError } from '../../../error.filter';
import { UpdateServiceNotificationDto, GetServiceNotificationsDto, UpdateAllServiceNotificationsDto } from '../../../dtos/event/notification/service-notification.dto';
import { SocketGateway } from '../../../socket.gateway';

@Controller('service-notification')
export class ServiceNotificationController {
    constructor(
        private readonly rmqService: RMQService,
        private readonly socketGateway: SocketGateway
    ) { }

    @HttpCode(200)
    @Post('get-service-notifications')
    async getNotifications(@Body() dto: GetServiceNotificationsDto) {
        try {
            return await this.rmqService.send<
                EventGetServiceNotifications.Request,
                EventGetServiceNotifications.Response
            >(EventGetServiceNotifications.topic, dto);
        } catch (e) {
            CatchError(e);
        }
    }

    @HttpCode(200)
    @Post('update-service-notification')
    async updateNotification(@Body() dto: UpdateServiceNotificationDto) {
        try {
            const newDto = await this.rmqService.send<
                EventUpdateServiceNotification.Request,
                EventUpdateServiceNotification.Response
            >(EventUpdateServiceNotification.topic, dto);
            this.socketGateway.sendNotificationToClient(newDto);
        } catch (e) {
            CatchError(e);
        }
    }

    @HttpCode(200)
    @Post('update-all-service-notifications')
    async updateAllNotifications(@Body() dto: UpdateAllServiceNotificationsDto) {
        try {
            const newDto = await this.rmqService.send<
                EventUpdateAllServiceNotifications.Request,
                EventUpdateAllServiceNotifications.Response
            >(EventUpdateAllServiceNotifications.topic, dto);
            this.socketGateway.sendNotificationsToClient(newDto);
        } catch (e) {
            CatchError(e);
        }
    }

    @RMQValidate()
    @RMQRoute(ApiEmitServiceNotifications.topic)
    async emitNotifications(@Body() dto: ApiEmitServiceNotifications.Request) {
        this.socketGateway.sendNotificationsToClients(dto);
    }

}
