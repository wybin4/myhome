import { TypeOrmModule } from "@nestjs/typeorm";
import { AppealEntity, TypeOfAppealEntity } from "./entities/appeal.entity";
import { AppealRepository, TypeOfAppealRepository } from "./repositories/appeal.repository";
import { Module } from "@nestjs/common";
import { AppealService } from "./appeal.service";
import { AppealController } from "./appeal.controller";

@Module({
    imports: [
        TypeOrmModule.forFeature([AppealEntity, TypeOfAppealEntity]),
    ],
    providers: [
        AppealRepository, TypeOfAppealRepository,
        AppealService,
    ],
    exports: [
        AppealRepository, TypeOfAppealRepository
    ],
    controllers: [AppealController],
})
export class AppealModule { }