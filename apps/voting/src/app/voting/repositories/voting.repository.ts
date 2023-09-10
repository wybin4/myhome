import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VotingEntity } from '../entities/voting.entity';

@Injectable()
export class VotingRepository {
    constructor(
        @InjectRepository(VotingEntity)
        private readonly votingRepository: Repository<VotingEntity>,
    ) { }

    async create(Voting: VotingEntity) {
        return this.votingRepository.save(Voting);
    }

    async findById(id: number) {
        return this.votingRepository.findOne({ where: { id } });
    }

    async findVotingsByMCId(managementCompanyId: number) {
        return this.votingRepository.find({
            where: {
                managementCompanyId: managementCompanyId,
            }
        });
    }
}