import { IUser, UserRole } from "@myhome/interfaces";
import { HttpStatus, Injectable } from "@nestjs/common";
import { RMQService } from "nestjs-rmq";
import { AdminRepository } from "./repositories/admin.repository";
import { OwnerRepository } from "./repositories/owner.repository";
import { ManagementCompanyRepository } from "./repositories/management-company.repository";
import { ADMIN_NOT_EXIST, OWNER_NOT_EXIST, MANAG_COMP_NOT_EXIST, INCORRECT_USER_ROLE, ADMINS_NOT_EXIST, MANAG_COMPS_NOT_EXIST, OWNERS_NOT_EXIST, RMQException, getUserIdsByAnotherRoleId } from "@myhome/constants";
import { UserEntity } from "./entities/user.entity";
import { AccountGetUsersByAnotherRole, IGetUserAndSubscriber } from "@myhome/contracts";

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
                user = await this.adminRepository.findUserById(id);
                if (!user) {
                    throw new RMQException(ADMIN_NOT_EXIST, HttpStatus.NOT_FOUND);
                }
                profile = new UserEntity(user).getPublicProfile();
                break;
            case UserRole.Owner:
                user = await this.ownerRepository.findUserById(id);
                if (!user) {
                    throw new RMQException(OWNER_NOT_EXIST, HttpStatus.NOT_FOUND);
                }
                profile = new UserEntity(user).getPublicProfile();
                break;
            case UserRole.ManagementCompany:
                user = await this.managementCompanyRepository.findUserById(id);
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
                const users = await this.adminRepository.findUsers(ids);
                if (!users.length) {
                    throw new RMQException(ADMINS_NOT_EXIST.message, ADMINS_NOT_EXIST.status);
                }
                for (const user of users) {
                    profiles.push(new UserEntity(user).getPublicProfile());
                }
                return { profiles };
            }
            case UserRole.Owner: {
                const users = await this.ownerRepository.findUsers(ids);
                if (!users.length) {
                    throw new RMQException(OWNERS_NOT_EXIST.message, OWNERS_NOT_EXIST.status);
                }
                for (const user of users) {
                    profiles.push(new UserEntity(user).getPublicProfile());
                }
                return { profiles };
            }
            case UserRole.ManagementCompany: {
                const users = await this.managementCompanyRepository.findUsers(ids);
                if (!users.length) {
                    throw new RMQException(MANAG_COMPS_NOT_EXIST.message, MANAG_COMPS_NOT_EXIST.status);
                }
                for (const user of users) {
                    profiles.push(new UserEntity(user).getPublicProfile());
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
                const user = await this.managementCompanyRepository.findUserById(dto.userId);
                if (!user) {
                    throw new RMQException(MANAG_COMP_NOT_EXIST, HttpStatus.NOT_FOUND);
                }
                const { anotherUserIds } = await getUserIdsByAnotherRoleId(this.rmqService, dto.userId, dto.userRole);
                const { profiles } = await this.usersInfo(anotherUserIds as number[], UserRole.Owner);
                return { users: profiles }
            }
            case UserRole.Owner: {
                const user = await this.ownerRepository.findUserById(dto.userId);
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

    // public async changeProfile(user: Pick<IUser, 'name'>, id: number) {
    //     const existedUser = await this.userRepository.findUserById(id);
    //     if (!existedUser) {
    //         throw new Error('Такого пользователя не существует');
    //     }
    //     const userEntity = new UserEntity(existedUser).updateProfile(user.name);
    //     await this.updateUser(await userEntity);
    //     return {};
    // }

    // private updateUser(user: UserEntity) {
    //     return Promise.all([
    //         this.userRepository.updateUser(user),
    //     ])
    // }
}