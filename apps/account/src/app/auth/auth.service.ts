import { HttpStatus, Injectable } from '@nestjs/common';
import { AdminEntity, ManagementCompanyEntity, OwnerEntity, UserEntity } from '../user/entities/user.entity';
import { UserRole } from '@myhome/interfaces';
import { JwtService } from '@nestjs/jwt';
import { AccountRegister } from '@myhome/contracts';
import { AdminRepository } from '../user/repositories/admin.repository';
import { ManagementCompanyRepository } from '../user/repositories/management-company.repository';
import { OwnerRepository } from '../user/repositories/owner.repository';
import { INCORRECT_USER_ROLE } from '@myhome/constants';
import { RMQError } from 'nestjs-rmq';
import { ERROR_TYPE } from 'nestjs-rmq/dist/constants';

@Injectable()
export class AuthService {
  constructor(
    private readonly adminRepository: AdminRepository,
    private readonly ownerRepository: OwnerRepository,
    private readonly managementCompanyRepository: ManagementCompanyRepository,
    private readonly jwtService: JwtService
  ) { }

  async register({ email, password, name, role }: AccountRegister.Request) {
    let newUserEntity, oldUser;

    switch (role) {
      case UserRole.Admin:
        oldUser = await this.adminRepository.findUser(email);
        if (oldUser) {
          throw new Error('Такой пользователь уже зарегистрирован');
        }
        newUserEntity = await new AdminEntity({ name, email, passwordHash: '' }).setPassword(password);
        await this.adminRepository.createUser(newUserEntity);
        break;
      case UserRole.Owner:
        oldUser = await this.ownerRepository.findUser(email);
        if (oldUser) {
          throw new Error('Такой пользователь уже зарегистрирован');
        }
        newUserEntity = await new OwnerEntity({ name, email, passwordHash: '' }).setPassword(password);
        await this.ownerRepository.createUser(newUserEntity);
        break;
      case UserRole.ManagementCompany:
        oldUser = await this.managementCompanyRepository.findUser(email);
        if (oldUser) {
          throw new Error('Такой пользователь уже зарегистрирован');
        }
        newUserEntity = await new ManagementCompanyEntity({ name, email, passwordHash: '' }).setPassword(password);
        await this.managementCompanyRepository.createUser(newUserEntity);
        break;
      default:
        throw new RMQError(INCORRECT_USER_ROLE, ERROR_TYPE.RMQ, HttpStatus.UNPROCESSABLE_ENTITY);
    }
    return { id: newUserEntity.id };
  }

  async validateUser(email: string, password: string, role: UserRole) {
    const user =
      (await this.adminRepository.findUser(email)) ||
      (await this.ownerRepository.findUser(email)) ||
      (await this.managementCompanyRepository.findUser(email));

    if (!user) {
      throw new Error('Неверный логин или пароль');
    }

    let userEntity: UserEntity;

    switch (role) {
      case UserRole.Admin:
        userEntity = new AdminEntity(user);
        break;
      case UserRole.Owner:
        userEntity = new OwnerEntity(user);
        break;
      case UserRole.ManagementCompany:
        userEntity = new ManagementCompanyEntity(user);
        break;
      default:
        throw new RMQError(INCORRECT_USER_ROLE, ERROR_TYPE.RMQ, HttpStatus.UNPROCESSABLE_ENTITY);
    }

    const isCorrectPassword = await userEntity.validatePassword(password);
    if (!isCorrectPassword) {
      throw new Error('Неверный логин или пароль');
    }

    return { id: userEntity.id };
  }
  async login(id: number) {
    return {
      access_token: await this.jwtService.signAsync({ id }),
    };
  }
}
