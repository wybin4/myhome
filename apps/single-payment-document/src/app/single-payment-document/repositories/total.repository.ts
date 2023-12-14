import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SinglePaymentDocumentTotalEntity } from '../entities/total.entity';
import { applyMeta } from '@myhome/constants';
import { IMeta } from '@myhome/interfaces';

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

    async findByMCId(managementCompanyId: number, meta: IMeta) {
        let queryBuilder = this.singlePaymentDocumentTotalRepository.createQueryBuilder('spd');
        queryBuilder.where('spd.managementCompanyId = :managementCompanyId', { managementCompanyId });
        const { queryBuilder: newQueryBuilder, totalCount } = await applyMeta<SinglePaymentDocumentTotalEntity>(queryBuilder, meta);
        queryBuilder = newQueryBuilder;
        return { spds: await queryBuilder.getMany(), totalCount };
    }

}