import { Injectable } from '@nestjs/common';
import { AdminEntity, ManagementCompanyEntity, OwnerEntity, UserEntity } from '../user/entities/user.entity';
import { UserRole } from '@myhome/interfaces';
import { JwtService } from '@nestjs/jwt';
import { AccountRegister, EmailRegister } from '@myhome/contracts';
import { AdminRepository } from '../user/repositories/admin.repository';
import { ManagementCompanyRepository } from '../user/repositories/management-company.repository';
import { OwnerRepository } from '../user/repositories/owner.repository';
import { INCORRECT_USER_ROLE, RMQException } from '@myhome/constants';
import { RMQService } from 'nestjs-rmq';

@Injectable()
export class AuthService {
  constructor(
    private readonly adminRepository: AdminRepository,
    private readonly ownerRepository: OwnerRepository,
    private readonly managementCompanyRepository: ManagementCompanyRepository,
    private readonly jwtService: JwtService,
    private readonly rmqService: RMQService,
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
        throw new RMQException(INCORRECT_USER_ROLE.message, INCORRECT_USER_ROLE.status);
    }

    await this.rmqService.notify(EmailRegister.topic,
      { user: newUserEntity, link: 'https://nx.dev/packages/nest' }
    );

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
        throw new RMQException(INCORRECT_USER_ROLE.message, INCORRECT_USER_ROLE.status);
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
