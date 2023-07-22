import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admins } from '../entities/user.entity';

@Injectable()
export class AdminRepository {
    constructor(
        @InjectRepository(Admins)
        private readonly adminRepository: Repository<Admins>,
    ) { }

    async createUser(user: Admins) {
        return this.adminRepository.save(user);
    }

    async findUser(email: string) {
        return this.adminRepository.findOne({ where: { email } });
    }

    async findUserById(id: number) {
        return this.adminRepository.findOne({ where: { id } });
    }

    async deleteUser(email: string) {
        await this.adminRepository.delete({ email });
    }

}