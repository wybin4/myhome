import { Body, Controller, Post } from '@nestjs/common';
import { RMQError, RMQRoute, RMQValidate } from 'nestjs-rmq';
import { ServiceNotificationService } from '../services/service-notification.service';
import { ERROR_TYPE } from 'nestjs-rmq/dist/constants';
import { AddServiceNotification, GetServiceNotifications, UpdateServiceNotification } from '@myhome/contracts';

@Controller("service-notification")
export class ServiceNotificationController {
    constructor(
        private readonly serviceNotificationService: ServiceNotificationService,
    ) { }

    @RMQValidate()
    @RMQRoute(GetServiceNotifications.topic)
    async getServiceNotifications(@Body() dto: GetServiceNotifications.Request) {
        try {
            return this.serviceNotificationService.getServiceNotifications(dto);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.code);
        }
    }

    @Post("add")
    @RMQValidate()
    @RMQRoute(AddServiceNotification.topic)
    async addServiceNotification(@Body() dto: AddServiceNotification.Request) {
        try {
            return this.serviceNotificationService.addServiceNotification(dto);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.code);
        }
    }

    @RMQValidate()
    @RMQRoute(UpdateServiceNotification.topic)
    async updateServiceNotification(@Body() dto: UpdateServiceNotification.Request) {
        try {
            return this.serviceNotificationService.updateServiceNotification(dto);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.code);
        }
    }

}
