import { Body, Controller, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { EventUpdateServiceNotification, EventGetServiceNotifications, ApiEmitServiceNotifications, EventUpdateAllServiceNotifications, EventAddServiceNotification } from '@myhome/contracts';
import { RMQRoute, RMQService, RMQValidate } from 'nestjs-rmq';
import { CatchError } from '../../../error.filter';
import { UpdateServiceNotificationDto, GetServiceNotificationsDto, UpdateAllServiceNotificationsDto, AddServiceNotificationDto } from '../../../dtos/event/notification/service-notification.dto';
import { SocketGateway } from '../../../socket.gateway';
import { JWTAuthGuard } from '../../../guards/jwt.guard';
import { IJWTPayload } from '@myhome/interfaces';

@Controller('service-notification')
export class ServiceNotificationController {
    constructor(
        private readonly rmqService: RMQService,
        private readonly socketGateway: SocketGateway
    ) { }

    @UseGuards(JWTAuthGuard)
    @HttpCode(200)
    @Post('get-service-notifications')
    async getNotifications(@Req() req: { user: IJWTPayload }, @Body() dto: GetServiceNotificationsDto) {
        try {
            return await this.rmqService.send<
                EventGetServiceNotifications.Request,
                EventGetServiceNotifications.Response
            >(EventGetServiceNotifications.topic, { ...dto, ...req.user });
        } catch (e) {
            CatchError(e);
        }
    }

    @UseGuards(JWTAuthGuard)
    @HttpCode(201)
    @Post('add-service-notification')
    async addNotification(@Req() req: { user: IJWTPayload }, @Body() dto: AddServiceNotificationDto) {
        try {
            const newDto = await this.rmqService.send<
                EventAddServiceNotification.Request,
                EventAddServiceNotification.Response
            >(EventAddServiceNotification.topic, { ...dto, ...req.user });
            this.socketGateway.sendNewNotification(newDto);
        } catch (e) {
            CatchError(e);
        }
    }

    @UseGuards(JWTAuthGuard)
    @HttpCode(200)
    @Post('update-service-notification')
    async updateNotification(@Body() dto: UpdateServiceNotificationDto) {
        try {
            const newDto = await this.rmqService.send<
                EventUpdateServiceNotification.Request,
                EventUpdateServiceNotification.Response
            >(EventUpdateServiceNotification.topic, dto);
            this.socketGateway.sendNewNotification(newDto);
        } catch (e) {
            CatchError(e);
        }
    }

    @UseGuards(JWTAuthGuard)
    @HttpCode(200)
    @Post('update-all-service-notifications')
    async updateAllNotifications(@Req() req: { user: IJWTPayload }, @Body() dto: UpdateAllServiceNotificationsDto) {
        try {
            const newDto = await this.rmqService.send<
                EventUpdateAllServiceNotifications.Request,
                EventUpdateAllServiceNotifications.Response
            >(EventUpdateAllServiceNotifications.topic, { ...dto, ...req.user });
            this.socketGateway.setUnreadNotifications(newDto, 0);
        } catch (e) {
            CatchError(e);
        }
    }

    @RMQValidate()
    @RMQRoute(ApiEmitServiceNotifications.topic)
    async emitNotifications(@Body() dto: ApiEmitServiceNotifications.Request) {
        this.socketGateway.sendNewNotifications(dto);
    }

}
