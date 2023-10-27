import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { HouseNotificationController } from "./controllers/house-notification.controller";
import { HouseNotificationEntity } from "./entities/house-notification.entity";
import { HouseNotificationRepository } from "./repositories/house-notification.repository";
import { HouseNotificationService } from "./services/house-notification.service";
import { ServiceNotificationEntity } from "./entities/service-notification.entity";
import { ServiceNotificationRepository } from "./repositories/service-notification.repository";
import { ServiceNotificationService } from "./services/service-notification.service";
import { ServiceNotificationController } from "./controllers/service-notification.controller";
import { ServiceNotificationEventEmitter } from "./service-notification.event-emitter";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            HouseNotificationEntity,
            ServiceNotificationEntity
        ]),
    ],
    providers: [
        HouseNotificationRepository, HouseNotificationService,
        ServiceNotificationRepository, ServiceNotificationService,
        ServiceNotificationEventEmitter
    ],
    controllers: [HouseNotificationController, ServiceNotificationController],
})
export class NotificationModule { }