import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DebtEntity } from './debt.entity';

@Injectable()
export class DebtRepository {
    constructor(
        @InjectRepository(DebtEntity)
        private readonly debtRepository: Repository<DebtEntity>,
    ) { }

    async createDebt(Debt: DebtEntity) {
        return this.debtRepository.save(Debt);
    }

    async findDebtById(id: number) {
        return this.debtRepository.findOne({ where: { id } });
    }

}