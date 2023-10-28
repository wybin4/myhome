import { TypeOrmModule } from "@nestjs/typeorm";
import { AppealEntity } from "./appeal.entity";
import { AppealRepository } from "./appeal.repository";
import { Module } from "@nestjs/common";
import { AppealController } from "./appeal.controller";
import { AppealService } from "./appeal.service";
import { NotificationModule } from "../notification/notification.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([AppealEntity]),
        NotificationModule
    ],
    providers: [
        AppealRepository,
        AppealService,
    ],
    exports: [
        AppealService
    ],
    controllers: [AppealController],
})
export class AppealModule { }