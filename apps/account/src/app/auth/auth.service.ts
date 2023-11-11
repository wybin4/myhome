import { HttpStatus, Injectable } from '@nestjs/common';
import { AdminEntity, ManagementCompanyEntity, OwnerEntity, UserEntity } from '../user/user.entity';
import { IUser, UserRole } from '@myhome/interfaces';
import { JwtService } from '@nestjs/jwt';
import { AccountRegister, EmailRegister, IAddUser } from '@myhome/contracts';
import { INCORRECT_ROLE_ACTION, RMQException, USER_ALREADY_EXIST } from '@myhome/constants';
import { RMQService } from 'nestjs-rmq';
import { AdminRepository, OwnerRepository, ManagementCompanyRepository, IUserRepository } from '../user/user.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly adminRepository: AdminRepository,
    private readonly ownerRepository: OwnerRepository,
    private readonly managementCompanyRepository: ManagementCompanyRepository,
    private readonly jwtService: JwtService,
    private readonly rmqService: RMQService,
  ) { }

  async register(dto: AccountRegister.Request) {
    const { registerRole, userRole, ...rest } = dto;

    if (
      (registerRole === UserRole.Admin && userRole === UserRole.ManagementCompany) ||
      (registerRole === UserRole.ManagementCompany && userRole === UserRole.Owner) ||
      (registerRole === UserRole.Admin && userRole === UserRole.Admin)
    ) {
      switch (dto.userRole) {
        case UserRole.Admin:
          return await this.genericAddUser<AdminEntity>
            (
              this.adminRepository,
              rest,
              AdminEntity,
              USER_ALREADY_EXIST
            );
        case UserRole.ManagementCompany:
          return await this.genericAddUser<ManagementCompanyEntity>
            (
              this.managementCompanyRepository,
              rest,
              ManagementCompanyEntity,
              USER_ALREADY_EXIST
            );
        case UserRole.Owner:
          return await this.genericAddUser<OwnerEntity>
            (
              this.ownerRepository,
              rest,
              OwnerEntity,
              USER_ALREADY_EXIST
            );
      }
    } else {
      throw new RMQException(INCORRECT_ROLE_ACTION.message, INCORRECT_ROLE_ACTION.status);
    }
  }

  private async genericAddUser<T extends UserEntity>(
    repository: IUserRepository<T>,
    dto: IAddUser,
    createInstance: new (dto: IUser) => T,
    error: { message: string, status: HttpStatus },
  ) {
    const old = await repository.findByEmail(dto.email);
    if (old && old.length) {
      throw new RMQException(error.message, error.status);
    }

    const newTEntity = await new createInstance({ ...dto, passwordHash: "" }).setPassword(dto.password);
    const newT = await repository.create(newTEntity);

    await this.rmqService.notify(EmailRegister.topic,
      { user: newT, link: 'https://nx.dev/packages/nest' }
    );

    return { user: newT };
  }

  // async validateUser(email: string, password: string, role: UserRole) {
  //   const user =
  //     (await this.adminRepository.findByEmail(email)) ||
  //     (await this.ownerRepository.findByEmail(email)) ||
  //     (await this.managementCompanyRepository.findByEmail(email));

  //   if (!user) {
  //     throw new Error('Неверный логин или пароль');
  //   }

  //   let userEntity: UserEntity;

  //   switch (role) {
  //     case UserRole.Admin:
  //       userEntity = new AdminEntity(user);
  //       break;
  //     case UserRole.Owner:
  //       userEntity = new OwnerEntity(user);
  //       break;
  //     case UserRole.ManagementCompany:
  //       userEntity = new ManagementCompanyEntity(user);
  //       break;
  //     default:
  //       throw new RMQException(INCORRECT_USER_ROLE.message, INCORRECT_USER_ROLE.status);
  //   }

  //   const isCorrectPassword = await userEntity.validatePassword(password);
  //   if (!isCorrectPassword) {
  //     throw new Error('Неверный логин или пароль');
  //   }

  //   return { id: userEntity.id };
  // }
  // async login(id: number) {
  //   return {
  //     access_token: await this.jwtService.signAsync({ id }),
  //   };
  // }
}
