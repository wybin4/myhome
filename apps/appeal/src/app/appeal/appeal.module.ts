import { TypeOrmModule } from "@nestjs/typeorm";
import { AppealEntity } from "./appeal.entity";
import { AppealRepository } from "./appeal.repository";
import { Module } from "@nestjs/common";
import { AppealController } from "./appeal.controller";
import { AppealService } from "./appeal.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([AppealEntity]),
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