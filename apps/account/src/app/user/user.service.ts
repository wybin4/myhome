import { IUser, UserRole } from "@myhome/interfaces";
import { HttpStatus, Injectable } from "@nestjs/common";
import { RMQService } from "nestjs-rmq";
import { ADMIN_NOT_EXIST, OWNER_NOT_EXIST, MANAG_COMP_NOT_EXIST, INCORRECT_USER_ROLE, ADMINS_NOT_EXIST, MANAG_COMPS_NOT_EXIST, OWNERS_NOT_EXIST, RMQException, getUserIdsByAnotherRoleId, INCORRECT_ROLE_ACCESS } from "@myhome/constants";
import { ManagementCompanyEntity, UserEntity } from "./user.entity";
import { AccountGetAllUsers, AccountGetUsersByAnotherRole, IGetUserAndSubscriber } from "@myhome/contracts";
import { AdminRepository, OwnerRepository, ManagementCompanyRepository } from "./user.repository";

@Injectable()
export class UserService {
    constructor(
        private readonly adminRepository: AdminRepository,
        private readonly ownerRepository: OwnerRepository,
        private readonly managementCompanyRepository: ManagementCompanyRepository,
        private readonly rmqService: RMQService,
    ) { }

    async userInfo(id: number, role: UserRole) {
        let user: IUser, profile: {
            email: string,
            name: string
        };
        switch (role) {
            case UserRole.Admin:
                user = await this.adminRepository.findById(id);
                if (!user) {
                    throw new RMQException(ADMIN_NOT_EXIST, HttpStatus.NOT_FOUND);
                }
                profile = new UserEntity(user).getPublicProfile();
                break;
            case UserRole.Owner:
                user = await this.ownerRepository.findById(id);
                if (!user) {
                    throw new RMQException(OWNER_NOT_EXIST, HttpStatus.NOT_FOUND);
                }
                profile = new UserEntity(user).getPublicProfile();
                break;
            case UserRole.ManagementCompany:
                user = await this.managementCompanyRepository.findById(id);
                if (!user) {
                    throw new RMQException(MANAG_COMP_NOT_EXIST, HttpStatus.NOT_FOUND);
                }
                profile = new UserEntity(user).getPublicProfile();
                break;
            default:
                throw new RMQException(INCORRECT_USER_ROLE.message, INCORRECT_USER_ROLE.status);
        }
        return { profile: profile };
    }

    async usersInfo(ids: number[], role: UserRole) {
        const profiles: Omit<IUser, "passwordHash">[] = [];

        switch (role) {
            case UserRole.Admin: {
                const users = await this.adminRepository.findByIds(ids);
                if (!users.length) {
                    throw new RMQException(ADMINS_NOT_EXIST.message, ADMINS_NOT_EXIST.status);
                }
                for (const user of users) {
                    profiles.push(new UserEntity(user).getPublicProfile());
                }
                return { profiles };
            }
            case UserRole.Owner: {
                const users = await this.ownerRepository.findByIds(ids);
                if (!users.length) {
                    throw new RMQException(OWNERS_NOT_EXIST.message, OWNERS_NOT_EXIST.status);
                }
                for (const user of users) {
                    profiles.push(new UserEntity(user).getPublicProfile());
                }
                return { profiles };
            }
            case UserRole.ManagementCompany: {
                const users = await this.managementCompanyRepository.findByIds(ids);
                if (!users.length) {
                    throw new RMQException(MANAG_COMPS_NOT_EXIST.message, MANAG_COMPS_NOT_EXIST.status);
                }
                for (const user of users) {
                    profiles.push(new ManagementCompanyEntity(user).getWithCheckingAccount());
                }
                return { profiles };
            }
            default:
                throw new RMQException(INCORRECT_USER_ROLE.message, INCORRECT_USER_ROLE.status);
        }
    }

    async getUsersByAnotherRole(dto: AccountGetUsersByAnotherRole.Request):
        Promise<AccountGetUsersByAnotherRole.Response> {
        switch (dto.userRole) {
            case UserRole.ManagementCompany: {
                const user = await this.managementCompanyRepository.findById(dto.userId);
                if (!user) {
                    throw new RMQException(MANAG_COMP_NOT_EXIST, HttpStatus.NOT_FOUND);
                }
                const { anotherUserIds } = await getUserIdsByAnotherRoleId(this.rmqService, dto.userId, dto.userRole);
                const { profiles } = await this.usersInfo(anotherUserIds as number[], UserRole.Owner);
                return { users: profiles }
            }
            case UserRole.Owner: {
                const user = await this.ownerRepository.findById(dto.userId);
                if (!user) {
                    throw new RMQException(OWNER_NOT_EXIST, HttpStatus.NOT_FOUND);
                }
                const { anotherUserIds } = await getUserIdsByAnotherRoleId(this.rmqService, dto.userId, dto.userRole);
                const anotherUserIdsArr = Array.from(new Set((
                    anotherUserIds as IGetUserAndSubscriber[])
                    .map(a => a.anotherUserId)
                ));
                const { profiles } = await this.usersInfo(anotherUserIdsArr, UserRole.ManagementCompany);
                return {
                    users: profiles.map(profile => {
                        const current = (anotherUserIds as IGetUserAndSubscriber[])
                            .filter(a => a.anotherUserId === profile.id)
                            .map(a => a.subscriber);
                        return {
                            user: profile,
                            subscribers: current
                        };
                    })
                }
            }
            default:
                throw new RMQException(INCORRECT_USER_ROLE.message, INCORRECT_USER_ROLE.status);
        }
    }

    async getAllUsers(dto: AccountGetAllUsers.Request): Promise<AccountGetAllUsers.Response> {
        if (dto.userRole === UserRole.ManagementCompany && dto.requesterRole === UserRole.Admin) {
            const managementCompanies = await this.managementCompanyRepository.findAll();
            return { profiles: managementCompanies.map(mc => mc.getWithCheckingAccount()) };
        } else if (dto.userRole === UserRole.Owner && dto.requesterRole === UserRole.ManagementCompany) {
            const owners = await this.ownerRepository.findAll();
            return { profiles: owners.map(mc => mc.getPublicProfile()) };
        } else {
            throw new RMQException(INCORRECT_ROLE_ACCESS.message, INCORRECT_ROLE_ACCESS.status);
        }
    }

    // public async changeProfile(user: Pick<IUser, 'name'>, id: number) {
    //     const existedUser = await this.userRepository.findById(id);
    //     if (!existedUser) {
    //         throw new Error('Такого пользователя не существует');
    //     }
    //     const userEntity = new UserEntity(existedUser).updateProfile(user.name);
    //     await this.update(await userEntity);
    //     return {};
    // }

    // private update(user: UserEntity) {
    //     return Promise.all([
    //         this.userRepository.update(user),
    //     ])
    // }
}