import { IUser, UserRole } from "@myhome/interfaces";
import { HttpStatus, Injectable } from "@nestjs/common";
import { RMQService } from "nestjs-rmq";
import { AdminRepository } from "./repositories/admin.repository";
import { OwnerRepository } from "./repositories/owner.repository";
import { ManagementCompanyRepository } from "./repositories/management-company.repository";
import { ADMIN_NOT_EXIST, OWNER_NOT_EXIST, MANAG_COMP_NOT_EXIST, INCORRECT_USER_ROLE, ADMINS_NOT_EXIST, MANAG_COMPS_NOT_EXIST, OWNERS_NOT_EXIST, RMQException, getOwnerIdsByMCId } from "@myhome/constants";
import { UserEntity } from "./entities/user.entity";

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
        let users: UserEntity[];
        const profiles = [];
        switch (role) {
            case UserRole.Admin:
                users = await this.adminRepository.findUsers(ids);
                if (!users.length) {
                    throw new RMQException(ADMINS_NOT_EXIST.message, ADMINS_NOT_EXIST.status);
                }
                for (const user of users) {
                    profiles.push(new UserEntity(user).getPublicProfile());
                }
                break;
            case UserRole.Owner:
                users = await this.ownerRepository.findUsers(ids);
                if (!users.length) {
                    throw new RMQException(OWNERS_NOT_EXIST.message, OWNERS_NOT_EXIST.status);
                }
                for (const user of users) {
                    profiles.push(new UserEntity(user).getPublicProfile());
                }
                break;
            case UserRole.ManagementCompany:
                users = await this.managementCompanyRepository.findUsers(ids);
                if (!users.length) {
                    throw new RMQException(MANAG_COMPS_NOT_EXIST.message, MANAG_COMPS_NOT_EXIST.status);
                }
                for (const user of users) {
                    profiles.push(new UserEntity(user).getPublicProfile());
                }
                break;
            default:
                throw new RMQException(INCORRECT_USER_ROLE.message, INCORRECT_USER_ROLE.status);
        }
        return { profiles: profiles };
    }

    async getOwnersByMCId(managementConpmayId: number) {
        const managementC = await this.managementCompanyRepository.findUserById(managementConpmayId);
        if (!managementC) {
            throw new RMQException(MANAG_COMP_NOT_EXIST, HttpStatus.NOT_FOUND);
        }
        const { ownerIds } = await getOwnerIdsByMCId(this.rmqService, managementConpmayId);
        const ownerItems = await this.ownerRepository.findUsers(ownerIds);
        if (!ownerItems.length) {
            throw new RMQException(OWNERS_NOT_EXIST.message, OWNERS_NOT_EXIST.status);
        }
        const owners = [];
        for (const ownerItem of ownerItems) {
            owners.push(new UserEntity(ownerItem).getPublicProfile());
        }
        return { owners: owners };
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