import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ManagementCompanyEntity } from '../entities/user.entity';


@Injectable()
export class ManagementCompanyRepository {
    constructor(
        @InjectRepository(ManagementCompanyEntity)
        private readonly managementCompanyRepository: Repository<ManagementCompanyEntity>,
    ) { }

    async createUser(user: ManagementCompanyEntity) {
        return this.managementCompanyRepository.save(user);
    }

    async findUser(email: string) {
        return this.managementCompanyRepository.findOne({ where: { email } });
    }

    async findUserById(id: number) {
        return this.managementCompanyRepository.findOne({ where: { id } });
    }

    async deleteUser(email: string) {
        await this.managementCompanyRepository.delete({ email });
    }

    async updateUser(user: ManagementCompanyEntity) {
        await this.managementCompanyRepository.update(user.id, user);
        return this.findUserById(user.id);
    }
}

