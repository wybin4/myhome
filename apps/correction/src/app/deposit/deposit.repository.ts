import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DepositEntity } from './deposit.entity';

@Injectable()
export class DepositRepository {
    constructor(
        @InjectRepository(DepositEntity)
        private readonly depositRepository: Repository<DepositEntity>,
    ) { }

    async createDeposit(Deposit: DepositEntity) {
        return await this.depositRepository.save(Deposit);
    }

    async findDepositById(id: number) {
        return await this.depositRepository.findOne({ where: { id } });
    }

    async findWithSpdIdsAndOutstandingDeposit(spdIds: number[]): Promise<DepositEntity[]> {
        return await this.depositRepository.createQueryBuilder('entity')
            .where('entity.singlePaymentDocumentId IN (:...spdIds)', { spdIds })
            .andWhere('entity.outstandingDeposit != 0')
            .getMany();
    }

}