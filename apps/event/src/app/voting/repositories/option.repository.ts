import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { OptionEntity } from '../entities/option.entity';

@Injectable()
export class OptionRepository {
    constructor(
        @InjectRepository(OptionEntity)
        private readonly optionRepository: Repository<OptionEntity>,
    ) { }

    async create(Option: OptionEntity) {
        return await this.optionRepository.save(Option);
    }

    async findById(id: number) {
        return await this.optionRepository.findOne({ where: { id } });
    }

    async findByVotingId(votingId: number) {
        return await this.optionRepository.find({ where: { votingId } });
    }

    async findByVotingIds(votingIds: number[]) {
        return await this.optionRepository.find({
            where: {
                votingId: In(votingIds),
            }
        });
    }

    async createMany(entities: OptionEntity[]): Promise<OptionEntity[]> {
        return await this.optionRepository.save(entities);
    }

    async update(option: OptionEntity) {
        await this.optionRepository.update(option.id, option);
        return this.findById(option.id);
    }
}