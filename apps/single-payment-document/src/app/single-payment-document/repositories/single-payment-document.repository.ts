import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CalculationState, IGetCorrection, IMeta } from '@myhome/interfaces';
import { SinglePaymentDocumentEntity } from '../entities/single-payment-document.entity';
import { applyMeta } from '@myhome/constants';

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

    async findBySIds(subscriberIds: number[], meta: IMeta) {
        let queryBuilder = this.singlePaymentDocumentRepository.createQueryBuilder('spd');
        queryBuilder.where('spd.subscriberId IN (:...subscriberIds)', { subscriberIds })
            .andWhere('spd.status = :status', { status: CalculationState.CorrectionsCalculated });
        const { queryBuilder: newQueryBuilder, totalCount } = await applyMeta<SinglePaymentDocumentEntity>(queryBuilder, meta);
        queryBuilder = newQueryBuilder;
        return { spds: await queryBuilder.getMany(), totalCount };
    }

    async update(singlePaymentDocument: SinglePaymentDocumentEntity) {
        const { id, ...rest } = singlePaymentDocument;
        return await this.singlePaymentDocumentRepository.update(id, rest);
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