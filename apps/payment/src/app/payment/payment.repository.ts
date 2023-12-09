import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { PaymentEntity } from './payment.entity';

@Injectable()
export class PaymentRepository {
    constructor(
        @InjectRepository(PaymentEntity)
        private readonly paymentRepository: Repository<PaymentEntity>,
    ) { }

    async create(Payment: PaymentEntity) {
        return this.paymentRepository.save(Payment);
    }

    async findById(id: number) {
        return this.paymentRepository.findOne({ where: { id } });
    }

    async findBySPDIds(spdIds: number[]) {
        return this.paymentRepository.find({ where: { singlePaymentDocumentId: In(spdIds) } });
    }

}