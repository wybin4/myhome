import { Injectable } from '@nestjs/common';
import { UserRepository } from '../user/repositories/user.repository';
import { Users } from '../user/entities/user.entity';
import { UserRole } from '@myhome/interfaces';
import { JwtService } from '@nestjs/jwt';
import { AccountRegister } from '@myhome/contracts';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService
  ) { }

  async register({ email, password, name }: AccountRegister.Request) {
    const oldUser = await this.userRepository.findUser(email);
    if (oldUser) {
      throw new Error('Такой пользователь уже зарегистрирован');
    }
    const newUserEntity = await new Users({
      name,
      email,
      passwordHash: '',
      role: UserRole.Owner,
    }).setPassword(password);
    const newUser = await this.userRepository.createUser(newUserEntity);
    return { id: newUser.id };
  }

  async validateUser(email: string, password: string) {
    const user = await this.userRepository.findUser(email);
    if (!user) {
      throw new Error('Неверный логин или пароль');
    }
    const userEntity = new Users(user);
    const isCorrectPassword = await userEntity.validatePassword(password);
    if (!isCorrectPassword) {
      throw new Error('Неверный логин или пароль');
    }
    return { id: user.id };
  }
  async login(id: number) {
    return {
      access_token: await this.jwtService.signAsync({ id }),
    };
  }
}
