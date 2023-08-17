import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DocumentDetailRepository } from "./document-detail.repository";
import { DocumentDetailEntity } from "./document-detail.entity";
import { DocumentDetailController } from "./document-detail.controller";
import { DocumentDetailService } from "./document-detail.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([DocumentDetailEntity]),
    ],
    providers: [DocumentDetailRepository, DocumentDetailService],
    controllers: [DocumentDetailController],
    exports: [DocumentDetailRepository],
})
export class DocumentDetailModule { }
