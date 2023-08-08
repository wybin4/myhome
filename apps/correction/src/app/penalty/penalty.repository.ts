import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PenaltyEntity } from './penalty.entity';

@Injectable()
export class PenaltyRepository {
    constructor(
        @InjectRepository(PenaltyEntity)
        private readonly penaltyRepository: Repository<PenaltyEntity>,
    ) { }

    async createPenalty(Penalty: PenaltyEntity) {
        return this.penaltyRepository.save(Penalty);
    }

    async findPenaltyById(id: number) {
        return this.penaltyRepository.findOne({ where: { id } });
    }

}