import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ManagementCompanyEntity } from '../entities/user.entity';


@Injectable()
export class ManagementCompanyRepository {
    constructor(
        @InjectRepository(ManagementCompanyEntity)
        private readonly managementCompanyRepository: Repository<ManagementCompanyEntity>,
    ) { }

    async createUser(user: ManagementCompanyEntity) {
        return await this.managementCompanyRepository.save(user);
    }

    async findUser(email: string) {
        return await this.managementCompanyRepository.findOne({ where: { email } });
    }

    async findUserById(id: number) {
        return await this.managementCompanyRepository.findOne({ where: { id } });
    }

    async deleteUser(email: string) {
        await this.managementCompanyRepository.delete({ email });
    }

    async updateUser(user: ManagementCompanyEntity) {
        await this.managementCompanyRepository.update(user.id, user);
        return await this.findUserById(user.id);
    }

    async findUsers(ids: number[]) {
        return await this.managementCompanyRepository.find({
            where: {
                id: In(ids),
            }
        });
    }
}

