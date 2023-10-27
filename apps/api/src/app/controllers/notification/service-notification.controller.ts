import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { UpdateServiceNotification, GetServiceNotifications, EmitServiceNotification, EmitServiceNotifications } from '@myhome/contracts';
import { RMQRoute, RMQService, RMQValidate } from 'nestjs-rmq';
import { CatchError } from '../../error.filter';
import { UpdateServiceNotificationDto, GetServiceNotificationsDto } from '../../dtos/notification/service-notification.dto';
import { SocketGateway } from '../../socket.gateway';

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
    @RMQRoute(EmitServiceNotification.topic)
    async emitNotification(@Body() dto: EmitServiceNotification.Request) {
        this.socketGateway.sendNotificationToClients(dto.notification);
    }

    @RMQValidate()
    @RMQRoute(EmitServiceNotifications.topic)
    async emitNotifications(@Body() dto: EmitServiceNotifications.Request) {
        this.socketGateway.sendNotificationsToClients(dto.notifications);
    }

}
