import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SinglePaymentDocumentTotalEntity } from '../entities/total.entity';

@Injectable()
export class SinglePaymentDocumentTotalRepository {
    constructor(
        @InjectRepository(SinglePaymentDocumentTotalEntity)
        private readonly singlePaymentDocumentTotalRepository: Repository<SinglePaymentDocumentTotalEntity>,
    ) { }

    async create(SinglePaymentDocument: SinglePaymentDocumentTotalEntity) {
        return await this.singlePaymentDocumentTotalRepository.save(SinglePaymentDocument);
    }

    async createMany(entities: SinglePaymentDocumentTotalEntity[]): Promise<SinglePaymentDocumentTotalEntity[]> {
        return await this.singlePaymentDocumentTotalRepository.save(entities);
    }

    async findById(id: number) {
        return await this.singlePaymentDocumentTotalRepository.findOne({ where: { id } });
    }

    async findByMCId(managementCompanyId: number) {
        return await this.singlePaymentDocumentTotalRepository.find({ where: { managementCompanyId } });
    }

}