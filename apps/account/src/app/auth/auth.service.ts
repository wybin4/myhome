import { Injectable } from '@nestjs/common';
import { AdminEntity, ManagementCompanyEntity, OwnerEntity, UserEntity } from '../user/user.entity';
import { IJWTPayload, IUser, UserRole } from '@myhome/interfaces';
import { JwtService } from '@nestjs/jwt';
import { AccountLogin, AccountRefresh, AccountRegister, AccountRegisterMany, AccountSetPassword, EmailRegister, EmailRegisterMany, IAddUser, IAddUsers } from '@myhome/contracts';
import { INCORRECT_LOGIN, INCORRECT_PASSWORD, INCORRECT_PASSWORD_LINK, INCORRECT_ROLE_ACTION, RMQException, USERS_ALREADY_EXIST, USER_ALREADY_EXIST, USER_NOT_EXIST } from '@myhome/constants';
import { RMQService } from 'nestjs-rmq';
import { AdminRepository, OwnerRepository, ManagementCompanyRepository, IUserRepository } from '../user/user.repository';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class AuthService {
  constructor(
    private readonly adminRepository: AdminRepository,
    private readonly ownerRepository: OwnerRepository,
    private readonly managementCompanyRepository: ManagementCompanyRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly rmqService: RMQService,
  ) { }

  async setPassword(dto: AccountSetPassword.Request): Promise<AccountSetPassword.Response> {
    switch (dto.userRole) {
      case UserRole.Admin:
        return await this.genericSetPassword<AdminEntity>(this.adminRepository, dto, AdminEntity);
      case UserRole.ManagementCompany:
        return await this.genericSetPassword<ManagementCompanyEntity>(this.managementCompanyRepository,
          dto, ManagementCompanyEntity);
      case UserRole.Owner:
        return await this.genericSetPassword<OwnerEntity>(this.ownerRepository, dto, OwnerEntity);
    }
  }

  async register(dto: AccountRegister.Request): Promise<AccountRegister.Response> {
    const { registerRole, userRole, ...rest } = dto;

    if (
      (registerRole === UserRole.Admin && userRole === UserRole.ManagementCompany) ||
      (registerRole === UserRole.ManagementCompany && userRole === UserRole.Owner) ||
      (registerRole === UserRole.Admin && userRole === UserRole.Admin)
    ) {
      switch (userRole) {
        case UserRole.Admin:
          return await this.genericAddUser<AdminEntity>(this.adminRepository, rest, AdminEntity);
        case UserRole.ManagementCompany:
          return await this.genericAddUser<ManagementCompanyEntity>(this.managementCompanyRepository,
            rest, ManagementCompanyEntity);
        case UserRole.Owner:
          return await this.genericAddUser<OwnerEntity>(this.ownerRepository, rest, OwnerEntity);
      }
    } else {
      throw new RMQException(INCORRECT_ROLE_ACTION.message, INCORRECT_ROLE_ACTION.status);
    }
  }

  async registerMany(dto: AccountRegisterMany.Request): Promise<AccountRegisterMany.Response> {
    const { registerRole, userRole, users } = dto;

    if (
      (registerRole === UserRole.Admin && userRole === UserRole.ManagementCompany) ||
      (registerRole === UserRole.ManagementCompany && userRole === UserRole.Owner) ||
      (registerRole === UserRole.Admin && userRole === UserRole.Admin)
    ) {
      switch (userRole) {
        case UserRole.Admin:
          return await this.genericAddUsers<AdminEntity>(this.adminRepository, users, AdminEntity);
        case UserRole.ManagementCompany:
          return await this.genericAddUsers<ManagementCompanyEntity>(this.managementCompanyRepository,
            users, ManagementCompanyEntity);
        case UserRole.Owner:
          return await this.genericAddUsers<OwnerEntity>(this.ownerRepository, users, OwnerEntity);
      }
    } else {
      throw new RMQException(INCORRECT_ROLE_ACTION.message, INCORRECT_ROLE_ACTION.status);
    }
  }

  private async genericSetPassword<T extends UserEntity>(
    repository: IUserRepository<T>,
    dto: AccountSetPassword.Request,
    createInstance: new (dto: IUser) => T
  ) {
    const old = await repository.findByLink(dto.link);
    if (!old) {
      throw new RMQException(INCORRECT_PASSWORD_LINK.message, INCORRECT_PASSWORD_LINK.status);
    }
    const newTEntity = await new createInstance({ ...old, passwordHash: "", link: "" }).setPassword(dto.password);
    const newT = await repository.update(newTEntity);
    return { profile: newT.getPublicProfile() };
  }

  private async genericAddUser<T extends UserEntity>(
    repository: IUserRepository<T>,
    dto: IAddUser,
    createInstance: new (dto: IUser) => T
  ) {
    const old = await repository.findByEmail(dto.email);
    if (old) {
      throw new RMQException(USER_ALREADY_EXIST.message, USER_ALREADY_EXIST.status);
    }
    const newTEntity = new createInstance({ ...dto, passwordHash: "", link: uuidv4() });
    const newT = await repository.create(newTEntity);

    await this.rmqService.notify(EmailRegister.topic,
      { user: newT, link: 'https://nx.dev/packages/nest' }
    );

    return { profile: newT.getWithCheckingAccount() };
  }

  private async genericAddUsers<T extends UserEntity>(
    repository: IUserRepository<T>,
    dto: IAddUsers[],
    createInstance: new (dto: IUser) => T
  ) {
    const olds = await repository.findManyByEmails(dto.map(d => d.email));
    if (olds.length > 0) {
      throw new RMQException(USERS_ALREADY_EXIST.message, USERS_ALREADY_EXIST.status);
    }
    const newEntities = dto.map(d => new createInstance({ ...d, passwordHash: "", link: uuidv4() }));
    const news = await repository.createMany(newEntities);

    await this.rmqService.notify(EmailRegisterMany.topic,
      { users: news, link: 'https://nx.dev/packages/nest' }
    );

    return { profiles: news.map(n => n.getWithCheckingAccount()) };
  }

  async validateUser(dto: AccountLogin.Request) {
    switch (dto.userRole) {
      case UserRole.Admin:
        return await this.genericValidateUser(this.adminRepository, dto, AdminEntity);
      case UserRole.Owner:
        return await this.genericValidateUser(this.ownerRepository, dto, OwnerEntity);
      case UserRole.ManagementCompany:
        return await this.genericValidateUser(this.managementCompanyRepository, dto, ManagementCompanyEntity);
    }
  }

  private async genericValidateUser<T extends UserEntity>(
    repository: IUserRepository<T>,
    dto: AccountLogin.Request,
    createInstance: new (t: UserEntity) => T,
  ) {
    const user = await repository.findByEmail(dto.email);
    if (!user) {
      throw new RMQException(INCORRECT_LOGIN.message, USER_NOT_EXIST.status);
    }

    const userEntity = new createInstance(user);

    const isCorrectPassword = await userEntity.validatePassword(dto.password);
    if (!isCorrectPassword) {
      throw new RMQException(INCORRECT_PASSWORD.message, INCORRECT_PASSWORD.status);
    }

    return { userId: userEntity.id, userRole: dto.userRole };
  }

  async login(user: IJWTPayload): Promise<AccountLogin.Response> {
    return {
      userId: user.userId,
      userRole: user.userRole,
      token: await this.jwtService.signAsync(user),
      refreshToken: await this.jwtService.signAsync(user, { expiresIn: this.configService.get("EXPIRE_REFRESH") })
    };
  }

  async refresh(user: AccountRefresh.Request) {
    return {
      token: await this.jwtService.signAsync(user),
    };
  }
}