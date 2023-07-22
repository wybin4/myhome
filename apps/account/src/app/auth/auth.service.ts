import { Injectable } from '@nestjs/common';
import { Admins, ManagementCompanies, Owners, Users } from '../user/entities/user.entity';
import { UserRole } from '@myhome/interfaces';
import { JwtService } from '@nestjs/jwt';
import { AccountRegister } from '@myhome/contracts';
import { AdminRepository } from '../user/repositories/admin.repository';
import { ManagementCompanyRepository } from '../user/repositories/management-company.repository';
import { OwnerRepository } from '../user/repositories/owner.repository';

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
        newUserEntity = await new Admins({ name, email, passwordHash: '' }).setPassword(password);
        await this.adminRepository.createUser(newUserEntity);
        break;
      case UserRole.Owner:
        oldUser = await this.ownerRepository.findUser(email);
        if (oldUser) {
          throw new Error('Такой пользователь уже зарегистрирован');
        }
        newUserEntity = await new Owners({ name, email, passwordHash: '' }).setPassword(password);
        await this.ownerRepository.createUser(newUserEntity);
        break;
      case UserRole.ManagementCompany:
        oldUser = await this.managementCompanyRepository.findUser(email);
        if (oldUser) {
          throw new Error('Такой пользователь уже зарегистрирован');
        }
        newUserEntity = await new ManagementCompanies({ name, email, passwordHash: '' }).setPassword(password);
        await this.managementCompanyRepository.createUser(newUserEntity);
        break;
      default:
        throw new Error('Некорректная роль пользователя');
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

    let userEntity: Users;

    switch (role) {
      case UserRole.Admin:
        userEntity = new Admins(user);
        break;
      case UserRole.Owner:
        userEntity = new Owners(user);
        break;
      case UserRole.ManagementCompany:
        userEntity = new ManagementCompanies(user);
        break;
      default:
        throw new Error('Некорректная роль пользователя');
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
