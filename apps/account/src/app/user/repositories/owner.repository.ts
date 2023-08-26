import { Injectable } from '@nestjs/common';
import { OwnerEntity } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

@Injectable()
export class OwnerRepository {
    constructor(
        @InjectRepository(OwnerEntity)
        private readonly ownerRepository: Repository<OwnerEntity>,
    ) { }

    async createUser(user: OwnerEntity) {
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

    async updateUser(user: OwnerEntity) {
        await this.ownerRepository.update(user.id, user);
        return this.findUserById(user.id);
    }

    async findUsers(ids: number[]) {
        return this.ownerRepository.find({
            where: {
                id: In(ids),
            }
        });
    }
}
