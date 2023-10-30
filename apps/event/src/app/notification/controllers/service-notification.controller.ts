import { Body, Controller } from '@nestjs/common';
import { RMQError, RMQRoute, RMQValidate } from 'nestjs-rmq';
import { ServiceNotificationService } from '../services/service-notification.service';
import { ERROR_TYPE } from 'nestjs-rmq/dist/constants';
import { EventAddServiceNotification, EventAddServiceNotifications, EventGetServiceNotifications, EventUpdateAllServiceNotifications, EventUpdateServiceNotification } from '@myhome/contracts';

@Controller("service-notification")
export class ServiceNotificationController {
    constructor(
        private readonly serviceNotificationService: ServiceNotificationService,
    ) { }

    @RMQValidate()
    @RMQRoute(EventGetServiceNotifications.topic)
    async getServiceNotifications(@Body() dto: EventGetServiceNotifications.Request) {
        try {
            return this.serviceNotificationService.getServiceNotifications(dto);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.code);
        }
    }

    @RMQValidate()
    @RMQRoute(EventAddServiceNotification.topic)
    async addServiceNotification(@Body() dto: EventAddServiceNotification.Request) {
        try {
            return this.serviceNotificationService.addServiceNotification(dto);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.code);
        }
    }

    @RMQValidate()
    @RMQRoute(EventAddServiceNotifications.topic)
    async addServiceNotifications(@Body() dto: EventAddServiceNotifications.Request) {
        try {
            return this.serviceNotificationService.addServiceNotifications(dto);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.code);
        }
    }

    @RMQValidate()
    @RMQRoute(EventUpdateServiceNotification.topic)
    async updateServiceNotification(@Body() dto: EventUpdateServiceNotification.Request) {
        try {
            return this.serviceNotificationService.updateServiceNotification(dto);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.code);
        }
    }

    @RMQValidate()
    @RMQRoute(EventUpdateAllServiceNotifications.topic)
    async updateAllServiceNotifications(@Body() dto: EventUpdateAllServiceNotifications.Request) {
        try {
            return this.serviceNotificationService.updateAllServiceNotifications(dto);
        } catch (e) {
            throw new RMQError(e.message, ERROR_TYPE.RMQ, e.code);
        }
    }

}
