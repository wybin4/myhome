import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
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

    async findVotingsByHouseIds(houseIds: number[]) {
        return this.votingRepository.find({
            where: {
                houseId: In(houseIds),
            }
        });
    }
}