import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppealEntity } from './appeal.entity';
import { applyMeta } from '@myhome/constants';
import { IMeta } from '@myhome/interfaces';

@Injectable()
export class AppealRepository {
    constructor(
        @InjectRepository(AppealEntity)
        private readonly appealRepository: Repository<AppealEntity>,
    ) { }

    async create(Appeal: AppealEntity) {
        return await this.appealRepository.save(Appeal);
    }

    async findById(id: number) {
        return await this.appealRepository.findOne({ where: { id } });
    }

    async findByMCId(managementCompanyId: number, meta: IMeta) {
        let queryBuilder = this.appealRepository.createQueryBuilder('appeal');
        queryBuilder.where('appeal.managementCompanyId = :managementCompanyId', { managementCompanyId })
            .orderBy('appeal.createdAt', 'DESC');
        const { queryBuilder: newQueryBuilder, totalCount } = await applyMeta<AppealEntity>(queryBuilder, meta);
        queryBuilder = newQueryBuilder;

        return { appeals: await queryBuilder.getMany(), totalCount };
    }


    async findBySIds(subscriberIds: number[], meta: IMeta) {
        let queryBuilder = this.appealRepository.createQueryBuilder('appeal');
        queryBuilder.where('appeal.subscriberId IN (:...subscriberIds)', { subscriberIds })
            .orderBy('appeal.createdAt', 'DESC');
        const { queryBuilder: newQueryBuilder, totalCount } = await applyMeta<AppealEntity>(queryBuilder, meta);
        queryBuilder = newQueryBuilder;
        return { appeals: await queryBuilder.getMany(), totalCount };
    }

    async update(appeal: AppealEntity) {
        await this.appealRepository.update(appeal.id, appeal);
        return await this.findById(appeal.id);
    }

}