import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOfServiceEnitity } from '../entities/type-of-service.entity';

@Injectable()
export class TypeOfServiceRepository {
    constructor(
        @InjectRepository(TypeOfServiceEnitity)
        private readonly typeOfServiceRepository: Repository<TypeOfServiceEnitity>,
    ) { }

    async createTypeOfService(typeOfService: TypeOfServiceEnitity) {
        return this.typeOfServiceRepository.save(typeOfService);
    }

    async findTypeOfServiceById(id: number) {
        return this.typeOfServiceRepository.findOne({ where: { id } });
    }

}
