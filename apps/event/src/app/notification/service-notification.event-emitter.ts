import { Injectable } from "@nestjs/common";
import { ServiceNotificationEntity } from "./entities/service-notification.entity";
import { EventEmitServiceNotification, EventEmitServiceNotifications } from "@myhome/contracts";
import { RMQService } from "nestjs-rmq";

@Injectable()
export class ServiceNotificationEventEmitter {
    constructor(private readonly rmqService: RMQService) { }

    async handle(notification: ServiceNotificationEntity) {
        await this.rmqService.notify<EventEmitServiceNotification.Request>(EventEmitServiceNotification.topic, { notification });
    }

    async handleMany(notifications: ServiceNotificationEntity[]) {
        await this.rmqService.notify<EventEmitServiceNotifications.Request>(EventEmitServiceNotifications.topic, { notifications });
    }
}