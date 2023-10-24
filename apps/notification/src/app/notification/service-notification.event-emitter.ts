import { Injectable } from "@nestjs/common";
import { RMQService } from "nestjs-rmq";
import { ServiceNotificationEntity } from "./entities/service-notification.entity";
import { GetServiceNotification } from "@myhome/contracts";

@Injectable()
export class ServiceNotificationEventEmitter {
    constructor(private readonly rmqService: RMQService) { }

    async handle(notification: ServiceNotificationEntity) {
        await this.rmqService.notify<GetServiceNotification.Request>(GetServiceNotification.topic, { notification });
    }
}