import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PublicUtilityController } from "./public-utility.controller";
import { PublicUtilityService } from "./public-utility.service";
import { DocumentDetailEntity } from "../document-detail/document-detail.entity";
import { DocumentDetailModule } from "../document-detail/document-detail.module";

@Module({
    imports: [
        // TypeOrmModule.forFeature([DocumentDetailEntity]),
        DocumentDetailModule,
    ],
    providers: [PublicUtilityService],
    controllers: [PublicUtilityController],
})
export class PublicUtilityModule { }
