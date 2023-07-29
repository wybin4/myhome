import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { NotificationController } from "./notification.controller";
import { NotificationEntity } from "./notification.entity";
import { NotificationRepository } from "./notification.repository";
import { NotificationService } from "./notification.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([NotificationEntity]),
    ],
    providers: [NotificationRepository, NotificationService],
    exports: [NotificationRepository],
    controllers: [NotificationController],
})
export class NotificationModule { }