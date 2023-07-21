import { Users } from '../entities/user.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
  ) { }

  async createUser(user: Users) {
    return this.userRepository.save(user);
  }

  async findUser(email: string) {
    return this.userRepository.findOne({ where: { email } });
  }

  async findUserById(id: number) {
    return this.userRepository.findOne({ where: { id } });
  }

  async deleteUser(email: string) {
    await this.userRepository.delete({ email });
  }

  async updateUser(user: Users) {
    await this.userRepository.update(user.id, user);
    return this.findUserById(user.id);
  }
}

