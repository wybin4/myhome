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
        return await this.votingRepository.save(Voting);
    }

    async findById(id: number) {
        return await this.votingRepository.findOne({ where: { id } });
    }

    async findVotingsByHouseIds(houseIds: number[]) {
        return await this.votingRepository.createQueryBuilder('voting')
            .innerJoinAndSelect('voting.options', 'options')
            .leftJoinAndSelect('options.votes', 'votes')
            .where('voting.houseId IN (:...houseIds)', { houseIds })
            .getMany();
    }
}