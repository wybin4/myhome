import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { AppealEntity } from './appeal.entity';
import { AppealStatus } from '@myhome/interfaces';

@Injectable()
export class AppealRepository {
    constructor(
        @InjectRepository(AppealEntity)
        private readonly appealRepository: Repository<AppealEntity>,
    ) { }

    async create(Appeal: AppealEntity) {
        return this.appealRepository.save(Appeal);
    }

    async findById(id: number) {
        return this.appealRepository.findOne({ where: { id } });
    }

    async findByMCId(managementCompanyId: number) {
        return this.appealRepository.find({ where: { managementCompanyId } });
    }

    async findBySIds(subscriberIds: number[]) {
        return this.appealRepository.find({ where: { subscriberId: In(subscriberIds) } });
    }

    async close(id: number): Promise<AppealEntity | undefined> {
        const appeal = await this.findById(id);
        if (appeal) {
            appeal.status = AppealStatus.Closed;
            return this.appealRepository.save(appeal);
        }
        return undefined;
    }

    async reject(id: number): Promise<AppealEntity | undefined> {
        const appeal = await this.findById(id);
        if (appeal) {
            appeal.status = AppealStatus.Rejected;
            return this.appealRepository.save(appeal);
        }
        return undefined;
    }
}