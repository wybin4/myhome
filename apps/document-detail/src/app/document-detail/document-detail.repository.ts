import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentDetailEntity } from './document-detail.entity';

@Injectable()
export class DocumentDetailRepository {
    constructor(
        @InjectRepository(DocumentDetailEntity)
        private readonly detailRepository: Repository<DocumentDetailEntity>,
    ) { }

    async create(DocumentDetail: DocumentDetailEntity) {
        return this.detailRepository.save(DocumentDetail);
    }

    async findById(id: number) {
        return this.detailRepository.findOne({ where: { id } });
    }

    async deleteMany(ids: number[]) {
        return this.detailRepository.delete(ids);
    }

    async createMany(entities: DocumentDetailEntity[]): Promise<DocumentDetailEntity[]> {
        return this.detailRepository.save(entities);
    }

}