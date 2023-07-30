import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentDetailEntity } from './document-detail.entity';

@Injectable()
export class DocumentDetailRepository {
    constructor(
        @InjectRepository(DocumentDetailEntity)
        private readonly documentDetailRepository: Repository<DocumentDetailEntity>,
    ) { }

    async createDocumentDetail(DocumentDetail: DocumentDetailEntity) {
        return this.documentDetailRepository.save(DocumentDetail);
    }

    async findDocumentDetailById(id: number) {
        return this.documentDetailRepository.findOne({ where: { id } });
    }

}