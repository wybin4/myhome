import { Injectable } from "@nestjs/common";
import { ServiceNotificationEntity } from "./entities/service-notification.entity";
import { EmitServiceNotification, EmitServiceNotifications } from "@myhome/contracts";
import { RMQService } from "nestjs-rmq";

@Injectable()
export class ServiceNotificationEventEmitter {
    constructor(private readonly rmqService: RMQService) { }

    async handle(notification: ServiceNotificationEntity) {
        await this.rmqService.notify<EmitServiceNotification.Request>(EmitServiceNotification.topic, { notification });
    }

    async handleMany(notifications: ServiceNotificationEntity[]) {
        await this.rmqService.notify<EmitServiceNotifications.Request>(EmitServiceNotifications.topic, { notifications });
    }
}