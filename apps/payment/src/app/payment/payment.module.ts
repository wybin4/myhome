import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PaymentController } from "./payment.controller";
import { PaymentEntity } from "./payment.entity";
import { PaymentRepository } from "./payment.repository";
import { PaymentService } from "./payment.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([PaymentEntity]),
    ],
    providers: [PaymentRepository, PaymentService],
    exports: [PaymentRepository],
    controllers: [PaymentController],
})
export class PaymentModule { }