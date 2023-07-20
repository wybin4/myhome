import { UserEntity } from '../entities/user.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) { }

  async createUser(user: UserEntity) {
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

  async updateUser(user: UserEntity) {
    await this.userRepository.update(user.id, user);
    return this.findUserById(user.id);
  }
}
