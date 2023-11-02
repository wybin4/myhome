import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VoteEntity } from '../entities/vote.entity';

@Injectable()
export class VoteRepository {
    constructor(
        @InjectRepository(VoteEntity)
        private readonly voteRepository: Repository<VoteEntity>,
    ) { }

    async create(Vote: VoteEntity) {
        return await this.voteRepository.save(Vote);
    }

    async findById(id: number) {
        return await this.voteRepository.findOne({ where: { id } });
    }

}