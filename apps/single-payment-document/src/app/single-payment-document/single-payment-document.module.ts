import { Module } from "@nestjs/common";
import { SinglePaymentDocumentController } from "./single-payment-document.controller";
import { SinglePaymentDocumentService } from "./services/single-payment-document.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SinglePaymentDocumentEntity } from "./entities/single-payment-document.entity";
import { SinglePaymentDocumentRepository } from "./single-payment-document.repository";
import { PdfService } from "./services/pdf.service";
import { SinglePaymentDocumentTotalRepository } from "./repositories/total.repository";
import { SinglePaymentDocumentTotalEntity } from "./entities/total.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([SinglePaymentDocumentEntity, SinglePaymentDocumentTotalEntity]),
    ],
    providers: [
        SinglePaymentDocumentService, PdfService,
        SinglePaymentDocumentRepository, SinglePaymentDocumentTotalRepository
    ],
    controllers: [SinglePaymentDocumentController],
    exports: [SinglePaymentDocumentRepository],
})
export class SinglePaymentDocumentModule { }
