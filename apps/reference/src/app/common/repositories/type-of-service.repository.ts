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
        return this.typeOfServiceRepository.save(typeOfService);
    }

    async findById(id: number) {
        return this.typeOfServiceRepository.findOne({ where: { id } });
    }

    async findAll() {
        return this.typeOfServiceRepository.find();
    }

    async findMany(typeOfServiceIds: number[]) {
        return this.typeOfServiceRepository.find({
            where: {
                id: In(typeOfServiceIds),
            },
        });
    }

}
