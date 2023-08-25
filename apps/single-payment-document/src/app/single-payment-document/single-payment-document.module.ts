import { Module } from "@nestjs/common";
import { SinglePaymentDocumentController } from "./single-payment-document.controller";
import { SinglePaymentDocumentService } from "./services/single-payment-document.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SinglePaymentDocumentEntity } from "./single-payment-document.entity";
import { SinglePaymentDocumentRepository } from "./single-payment-document.repository";
import { PdfService } from "./services/pdf.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([SinglePaymentDocumentEntity]),
    ],
    providers: [SinglePaymentDocumentService, PdfService, SinglePaymentDocumentRepository],
    controllers: [SinglePaymentDocumentController],
    exports: [SinglePaymentDocumentRepository],
})
export class SinglePaymentDocumentModule { }
