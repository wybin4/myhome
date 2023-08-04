import { Module } from "@nestjs/common";
import { CommonHouseNeedController } from "./common-house-need.controller";
import { CommonHouseNeedService } from "./common-house-need.service";
import { DocumentDetailModule } from "../document-detail/document-detail.module";
import { PublicUtilityModule } from "../public-utility/public-utility.module";

@Module({
    imports: [
        DocumentDetailModule,
        PublicUtilityModule
    ],
    providers: [CommonHouseNeedService],
    controllers: [CommonHouseNeedController],
})
export class CommonHouseNeedModule { }
