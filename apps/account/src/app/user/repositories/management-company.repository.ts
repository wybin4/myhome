import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ManagementCompanies } from '../entities/user.entity';


@Injectable()
export class ManagementCompanyRepository {
    constructor(
        @InjectRepository(ManagementCompanies)
        private readonly managementCompanyRepository: Repository<ManagementCompanies>,
    ) { }

    async createUser(user: ManagementCompanies) {
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

    async updateUser(user: ManagementCompanies) {
        await this.managementCompanyRepository.update(user.id, user);
        return this.findUserById(user.id);
    }
}

