import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SinglePaymentDocumentEntity } from './single-payment-document.entity';

@Injectable()
export class SinglePaymentDocumentRepository {
    constructor(
        @InjectRepository(SinglePaymentDocumentEntity)
        private readonly singlePaymentDocumentRepository: Repository<SinglePaymentDocumentEntity>,
    ) { }

    async createSinglePaymentDocument(SinglePaymentDocument: SinglePaymentDocumentEntity) {
        return this.singlePaymentDocumentRepository.save(SinglePaymentDocument);
    }

    async findSinglePaymentDocumentById(id: number) {
        return this.singlePaymentDocumentRepository.findOne({ where: { id } });
    }

}