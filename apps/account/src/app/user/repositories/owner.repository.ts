import { Injectable } from '@nestjs/common';
import { Owners } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class OwnerRepository {
    constructor(
        @InjectRepository(Owners)
        private readonly ownerRepository: Repository<Owners>,
    ) { }

    async createUser(user: Owners) {
        return this.ownerRepository.save(user);
    }

    async findUser(email: string) {
        return this.ownerRepository.findOne({ where: { email } });
    }

    async findUserById(id: number) {
        return this.ownerRepository.findOne({ where: { id } });
    }

    async deleteUser(email: string) {
        await this.ownerRepository.delete({ email });
    }

    async updateUser(user: Owners) {
        await this.ownerRepository.update(user.id, user);
        return this.findUserById(user.id);
    }
}
