import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DocumentDetailRepository } from "./document-detail.repository";
import { DocumentDetailEntity } from "./document-detail.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([DocumentDetailEntity]),
    ],
    providers: [DocumentDetailRepository],
    exports: [DocumentDetailRepository],
})
export class DocumentDetailModule { }
