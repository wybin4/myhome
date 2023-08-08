import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PenaltyCalculationRuleEntity } from '../entities/penalty-calculation-rule.entity';

@Injectable()
export class PenaltyCalculationRuleRepository {
    constructor(
        @InjectRepository(PenaltyCalculationRuleEntity)
        private readonly penaltyCalculationRuleRepository: Repository<PenaltyCalculationRuleEntity>,
    ) { }

    async create(PenaltyCalculationRule: PenaltyCalculationRuleEntity) {
        return this.penaltyCalculationRuleRepository.save(PenaltyCalculationRule);
    }

    async findById(id: number) {
        return this.penaltyCalculationRuleRepository.findOne({ where: { id } });
    }

}