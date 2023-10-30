import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { IGetCorrection } from '@myhome/interfaces';
import { SinglePaymentDocumentEntity } from '../entities/single-payment-document.entity';

@Injectable()
export class SinglePaymentDocumentRepository {
    constructor(
        @InjectRepository(SinglePaymentDocumentEntity)
        private readonly singlePaymentDocumentRepository: Repository<SinglePaymentDocumentEntity>,
    ) { }

    async create(SinglePaymentDocument: SinglePaymentDocumentEntity) {
        return await this.singlePaymentDocumentRepository.save(SinglePaymentDocument);
    }

    async createMany(entities: SinglePaymentDocumentEntity[]): Promise<SinglePaymentDocumentEntity[]> {
        return await this.singlePaymentDocumentRepository.save(entities);
    }

    async findById(id: number) {
        return await this.singlePaymentDocumentRepository.findOne({ where: { id } });
    }

    async findBySIds(subscriberIds: number[]) {
        return await this.singlePaymentDocumentRepository.find({ where: { subscriberId: In(subscriberIds) } });
    }

    async update(singlePaymentDocument: SinglePaymentDocumentEntity) {
        const { id, ...rest } = singlePaymentDocument;
        return this.singlePaymentDocumentRepository.update(id, rest);
    }

    async updateMany(singlePaymentDocuments: SinglePaymentDocumentEntity[]) {
        const updatePromises = singlePaymentDocuments.map(async (doc) => {
            const { id, ...rest } = doc;
            return await this.singlePaymentDocumentRepository
                .createQueryBuilder()
                .update(SinglePaymentDocumentEntity)
                .set(rest)
                .where('id = :id', { id })
                .execute();
        });

        return Promise.all(updatePromises);
    }

    async getSPDIdsBySubscriberIds(subscriberIds: number[]): Promise<IGetCorrection[]> {
        const queryBuilder = this.singlePaymentDocumentRepository.createQueryBuilder('spd')
            .select('spd.subscriberId', 'subscriberId')
            .addSelect('spd.id', 'SPDId')
            .where('spd.subscriberId IN (:...subscriberIds)', { subscriberIds });

        const results = await queryBuilder.getRawMany();

        const groupedResults: { [key: number]: { subscriberId: number; spdIds: number[] } } = {};

        results.forEach(result => {
            if (!groupedResults[result.subscriberId]) {
                groupedResults[result.subscriberId] = {
                    subscriberId: result.subscriberId,
                    spdIds: [],
                };
            }
            groupedResults[result.subscriberId].spdIds.push(result.SPDId);
        });

        return Object.values(groupedResults);
    }
}