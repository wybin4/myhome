import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { HouseNotificationController } from "./controllers/house-notification.controller";
import { HouseNotificationEntity } from "./entities/house-notification.entity";
import { HouseNotificationRepository } from "./repositories/house-notification.repository";
import { HouseNotificationService } from "./services/house-notification.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([HouseNotificationEntity]),
    ],
    providers: [HouseNotificationRepository, HouseNotificationService],
    controllers: [HouseNotificationController],
})
export class NotificationModule { }