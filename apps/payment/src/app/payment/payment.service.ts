import {  Injectable } from "@nestjs/common";
import { PaymentRepository } from "./payment.repository";
import {  RMQService } from "nestjs-rmq";

@Injectable()
export class PaymentService {
    constructor(
        private readonly paymentRepository: PaymentRepository,
        private readonly rmqService: RMQService,
    ) { }

    public async getPayment(id: number) {
        ;
    }
    
}