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

    async createMany(entities: SinglePaymentDocumentEntity[]): Promise<SinglePaymentDocumentEntity[]> {
        return this.singlePaymentDocumentRepository.save(entities);
    }

    async findSinglePaymentDocumentById(id: number) {
        return this.singlePaymentDocumentRepository.findOne({ where: { id } });
    }

    async update(singlePaymentDocument: SinglePaymentDocumentEntity) {
        const { id, ...rest } = singlePaymentDocument;
        return this.singlePaymentDocumentRepository.update(id, rest);
    }
    async updateMany(singlePaymentDocuments: SinglePaymentDocumentEntity[]) {
        const updatePromises = singlePaymentDocuments.map(async (doc) => {
            const { id, ...rest } = doc;
            return this.singlePaymentDocumentRepository
                .createQueryBuilder()
                .update(SinglePaymentDocumentEntity)
                .set(rest)
                .where('id = :id', { id })
                .execute();
        });

        return Promise.all(updatePromises);
    }
}