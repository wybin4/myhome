import { Injectable } from "@nestjs/common";
import { ServiceNotificationEntity } from "./entities/service-notification.entity";
import { GetServiceNotification } from "@myhome/contracts";
import { RMQService } from "nestjs-rmq";

@Injectable()
export class ServiceNotificationEventEmitter {
    constructor(private readonly rmqService: RMQService) { }

    async handle(notification: ServiceNotificationEntity) {
        await this.rmqService.notify<GetServiceNotification.Request>(GetServiceNotification.topic, { notification });
    }
}