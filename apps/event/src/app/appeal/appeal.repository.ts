import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { AppealEntity } from './appeal.entity';

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

    async findByMCId(managementCompanyId: number) {
        return await this.appealRepository.find({ where: { managementCompanyId } });
    }

    async findBySIds(subscriberIds: number[]) {
        return await this.appealRepository.find({ where: { subscriberId: In(subscriberIds) } });
    }

    async update(appeal: AppealEntity) {
        await this.appealRepository.update(appeal.id, appeal);
        return await this.findById(appeal.id);
    }

}