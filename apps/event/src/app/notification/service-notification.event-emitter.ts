import { Injectable } from "@nestjs/common";
import { ServiceNotificationEntity } from "./entities/service-notification.entity";
import { ApiEmitServiceNotifications } from "@myhome/contracts";
import { RMQService } from "nestjs-rmq";

@Injectable()
export class ServiceNotificationEventEmitter {
    constructor(private readonly rmqService: RMQService) { }

    async handleMany(notifications: ServiceNotificationEntity[]) {
        await this.rmqService.notify<ApiEmitServiceNotifications.Request>(ApiEmitServiceNotifications.topic, { notifications });
    }
}