import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PenaltyRuleEntity } from '../entities/penalty-rule.entity';

@Injectable()
export class PenaltyRuleRepository {
    constructor(
        @InjectRepository(PenaltyRuleEntity)
        private readonly penaltyRuleRepository: Repository<PenaltyRuleEntity>,
    ) { }

    async createPenaltyRule(PenaltyRule: PenaltyRuleEntity) {
        return this.penaltyRuleRepository.save(PenaltyRule);
    }

    async findPenaltyRuleById(id: number) {
        return this.penaltyRuleRepository.findOne({ where: { id } });
    }

}