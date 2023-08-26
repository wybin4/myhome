import { Body, Controller, HttpStatus } from '@nestjs/common';
import { AdminRepository } from './repositories/admin.repository';
import { OwnerRepository } from './repositories/owner.repository';
import { ManagementCompanyRepository } from './repositories/management-company.repository';
import { AccountUserInfo, AccountUsersInfo } from '@myhome/contracts';
import { RMQValidate, RMQRoute, RMQError } from 'nestjs-rmq';
import { UserEntity } from './entities/user.entity';
import { UserRole } from '@myhome/interfaces';
import { ADMINS_NOT_EXIST, ADMIN_NOT_EXIST, INCORRECT_USER_ROLE, MANAG_COMPS_NOT_EXIST, MANAG_COMP_NOT_EXIST, OWNERS_NOT_EXIST, OWNER_NOT_EXIST } from '@myhome/constants';
import { ERROR_TYPE } from 'nestjs-rmq/dist/constants';

@Controller()
export class UserQueries {
	constructor(
		private readonly adminRepository: AdminRepository,
		private readonly ownerRepository: OwnerRepository,
		private readonly managementCompanyRepository: ManagementCompanyRepository,
	) { }

	@RMQValidate()
	@RMQRoute(AccountUserInfo.topic)
	async userInfo(@Body() { id, role }: AccountUserInfo.Request): Promise<AccountUserInfo.Response> {
		let user, profile;
		switch (role) {
			case UserRole.Admin:
				user = await this.adminRepository.findUserById(id);
				if (!user) {
					throw new RMQError(ADMIN_NOT_EXIST, ERROR_TYPE.RMQ, HttpStatus.NOT_FOUND);
				}
				profile = new UserEntity(user).getPublicProfile();
				break;
			case UserRole.Owner:
				user = await this.ownerRepository.findUserById(id);
				if (!user) {
					throw new RMQError(OWNER_NOT_EXIST, ERROR_TYPE.RMQ, HttpStatus.NOT_FOUND);
				}
				profile = new UserEntity(user).getPublicProfile();
				break;
			case UserRole.ManagementCompany:
				user = await this.managementCompanyRepository.findUserById(id);
				if (!user) {
					throw new RMQError(MANAG_COMP_NOT_EXIST, ERROR_TYPE.RMQ, HttpStatus.NOT_FOUND);
				}
				profile = new UserEntity(user).getPublicProfile();
				break;
			default:
				throw new RMQError(INCORRECT_USER_ROLE, ERROR_TYPE.RMQ, HttpStatus.UNPROCESSABLE_ENTITY);
		}
		return { profile };
	}

	@RMQValidate()
	@RMQRoute(AccountUsersInfo.topic)
	async usersInfo(@Body() { ids, role }: AccountUsersInfo.Request): Promise<AccountUsersInfo.Response> {
		let users: UserEntity[];
		const profiles = [];
		switch (role) {
			case UserRole.Admin:
				users = await this.adminRepository.findUsers(ids);
				if (!users.length) {
					throw new RMQError(ADMINS_NOT_EXIST.message, ERROR_TYPE.RMQ, ADMINS_NOT_EXIST.status);
				}
				for (const user of users) {
					profiles.push(new UserEntity(user));
				}
				break;
			case UserRole.Owner:
				users = await this.ownerRepository.findUsers(ids);
				if (!users.length) {
					throw new RMQError(OWNERS_NOT_EXIST.message, ERROR_TYPE.RMQ, OWNERS_NOT_EXIST.status);
				}
				for (const user of users) {
					profiles.push(new UserEntity(user));
				}
				break;
			case UserRole.ManagementCompany:
				users = await this.managementCompanyRepository.findUsers(ids);
				if (!users.length) {
					throw new RMQError(MANAG_COMPS_NOT_EXIST.message, ERROR_TYPE.RMQ, MANAG_COMPS_NOT_EXIST.status);
				}
				for (const user of users) {
					profiles.push(new UserEntity(user));
				}
				break;
			default:
				throw new RMQError(INCORRECT_USER_ROLE, ERROR_TYPE.RMQ, HttpStatus.UNPROCESSABLE_ENTITY);
		}
		return { profiles: profiles };
	}

}
