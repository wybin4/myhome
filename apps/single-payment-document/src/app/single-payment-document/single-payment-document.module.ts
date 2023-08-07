import { Module } from "@nestjs/common";
import { SinglePaymentDocumentController } from "./single-payment-document.controller";
import { SinglePaymentDocumentService } from "./single-payment-document.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SinglePaymentDocumentEntity } from "./single-payment-document.entity";
import { SinglePaymentDocumentRepository } from "./single-payment-document.repository";

@Module({
    imports: [
        TypeOrmModule.forFeature([SinglePaymentDocumentEntity]),
    ],
    providers: [SinglePaymentDocumentService, SinglePaymentDocumentRepository],
    controllers: [SinglePaymentDocumentController],
    exports: [SinglePaymentDocumentRepository],
})
export class SinglePaymentDocumentModule { }
