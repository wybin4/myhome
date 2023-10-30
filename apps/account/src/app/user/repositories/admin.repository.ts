import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { AdminEntity } from '../entities/user.entity';

@Injectable()
export class AdminRepository {
    constructor(
        @InjectRepository(AdminEntity)
        private readonly adminRepository: Repository<AdminEntity>,
    ) { }

    async createUser(user: AdminEntity) {
        return await this.adminRepository.save(user);
    }

    async findUser(email: string) {
        return await this.adminRepository.findOne({ where: { email } });
    }

    async findUserById(id: number) {
        return await this.adminRepository.findOne({ where: { id } });
    }

    async deleteUser(email: string) {
        await this.adminRepository.delete({ email });
    }

    async findUsers(ids: number[]) {
        return await this.adminRepository.find({
            where: {
                id: In(ids),
            }
        });
    }

}