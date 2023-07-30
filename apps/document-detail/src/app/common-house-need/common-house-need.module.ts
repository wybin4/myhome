import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CommonHouseNeedController } from "./common-house-need.controller";
import { CommonHouseNeedService } from "./common-house-need.service";
import { DocumentDetailEntity } from "../document-detail/document-detail.entity";
import { DocumentDetailModule } from "../document-detail/document-detail.module";

@Module({
    imports: [
        // TypeOrmModule.forFeature([DocumentDetailEntity]),
        DocumentDetailModule,
    ],
    providers: [CommonHouseNeedService],
    controllers: [CommonHouseNeedController],
})
export class CommonHouseNeedModule { }
