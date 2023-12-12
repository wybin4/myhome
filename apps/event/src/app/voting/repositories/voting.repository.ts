import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VotingEntity } from '../entities/voting.entity';
import { applyMeta } from '@myhome/constants';
import { IMeta } from '@myhome/interfaces';

@Injectable()
export class VotingRepository {
    constructor(
        @InjectRepository(VotingEntity)
        private readonly votingRepository: Repository<VotingEntity>,
    ) { }

    async create(Voting: VotingEntity) {
        return await this.votingRepository.save(Voting);
    }

    async findById(id: number) {
        return await this.votingRepository.findOne({ where: { id } });
    }

    async findVotingsByHouseIds(houseIds: number[], meta: IMeta) {
        let queryBuilder = this.votingRepository.createQueryBuilder('voting');
        queryBuilder.innerJoinAndSelect('voting.options', 'options')
            .leftJoinAndSelect('options.votes', 'votes')
            .where('voting.houseId IN (:...houseIds)', { houseIds });
        const { queryBuilder: newQueryBuilder, totalCount } = await applyMeta<VotingEntity>(queryBuilder, meta);
        queryBuilder = newQueryBuilder;
        return { votings: await queryBuilder.getMany(), totalCount };
    }
}