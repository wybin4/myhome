import { Module } from "@nestjs/common";
import { PublicUtilityController } from "./public-utility.controller";
import { PublicUtilityService } from "./public-utility.service";
import { DocumentDetailModule } from "../document-detail/document-detail.module";

@Module({
    imports: [
        DocumentDetailModule,
    ],
    providers: [PublicUtilityService],
    controllers: [PublicUtilityController],
    exports: [PublicUtilityService]
})
export class PublicUtilityModule { }
