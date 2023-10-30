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

    async close(id: number): Promise<AppealEntity | undefined> {
        const appeal = await this.findById(id);
        if (appeal) {
            appeal.status = AppealStatus.Closed;
            return await this.appealRepository.save(appeal);
        }
        return undefined;
    }

    async reject(id: number): Promise<AppealEntity | undefined> {
        const appeal = await this.findById(id);
        if (appeal) {
            appeal.status = AppealStatus.Rejected;
            return await this.appealRepository.save(appeal);
        }
        return undefined;
    }
}