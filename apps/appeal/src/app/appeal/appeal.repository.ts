import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppealEntity, TypeOfAppealEntity } from './appeal.entity';
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

    async findBySId(subscriberId: number) {
        return this.appealRepository.find({ where: { subscriberId } });
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


@Injectable()
export class TypeOfAppealRepository {
    constructor(
        @InjectRepository(TypeOfAppealEntity)
        private readonly typeOfAppealRepository: Repository<TypeOfAppealEntity>,
    ) { }

    async create(typeOfAppeal: TypeOfAppealEntity) {
        return this.typeOfAppealRepository.save(typeOfAppeal);
    }

    async findById(id: number) {
        return this.typeOfAppealRepository.findOne({ where: { id } });
    }

    async findMany() {
        return this.typeOfAppealRepository.find();
    }
}
