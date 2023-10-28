import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { EventUpdateServiceNotification, EventGetServiceNotifications, ApiEmitServiceNotification, ApiEmitServiceNotifications } from '@myhome/contracts';
import { RMQRoute, RMQService, RMQValidate } from 'nestjs-rmq';
import { CatchError } from '../../../error.filter';
import { UpdateServiceNotificationDto, GetServiceNotificationsDto } from '../../../dtos/event/notification/service-notification.dto';
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
            return await this.rmqService.send<
                EventUpdateServiceNotification.Request,
                EventUpdateServiceNotification.Response
            >(EventUpdateServiceNotification.topic, dto);
        } catch (e) {
            CatchError(e);
        }
    }

    @RMQValidate()
    @RMQRoute(ApiEmitServiceNotification.topic)
    async emitNotification(@Body() dto: ApiEmitServiceNotification.Request) {
        this.socketGateway.sendNotificationToClients(dto.notification);
    }

    @RMQValidate()
    @RMQRoute(ApiEmitServiceNotifications.topic)
    async emitNotifications(@Body() dto: ApiEmitServiceNotifications.Request) {
        this.socketGateway.sendNotificationsToClients(dto.notifications);
    }

}
