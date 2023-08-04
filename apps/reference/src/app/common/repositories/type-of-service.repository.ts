import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOfServiceEntity } from '../entities/type-of-service.entity';

@Injectable()
export class TypeOfServiceRepository {
    constructor(
        @InjectRepository(TypeOfServiceEntity)
        private readonly typeOfServiceRepository: Repository<TypeOfServiceEntity>,
    ) { }

    async createTypeOfService(typeOfService: TypeOfServiceEntity) {
        return this.typeOfServiceRepository.save(typeOfService);
    }

    async findTypeOfServiceById(id: number) {
        return this.typeOfServiceRepository.findOne({ where: { id } });
    }

    async findAllTypesOfService() {
        return this.typeOfServiceRepository.find();
    }
}
