import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { TypeOfServiceEntity } from '../entities/type-of-service.entity';

@Injectable()
export class TypeOfServiceRepository {
    constructor(
        @InjectRepository(TypeOfServiceEntity)
        private readonly typeOfServiceRepository: Repository<TypeOfServiceEntity>,
    ) { }

    async create(typeOfService: TypeOfServiceEntity) {
        return await this.typeOfServiceRepository.save(typeOfService);
    }

    async findById(id: number) {
        return await this.typeOfServiceRepository.findOne({ where: { id } });
    }

    async findAll() {
        return await this.typeOfServiceRepository.find();
    }

    async findMany(typeOfServiceIds: number[]) {
        return await this.typeOfServiceRepository.find({
            where: {
                id: In(typeOfServiceIds),
            },
        });
    }

}
