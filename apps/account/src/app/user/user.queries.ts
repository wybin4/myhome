import { Body, Controller, HttpStatus, NotFoundException } from '@nestjs/common';
import { AdminRepository } from './repositories/admin.repository';
import { OwnerRepository } from './repositories/owner.repository';
import { ManagementCompanyRepository } from './repositories/management-company.repository';
import { AccountUserInfo } from '@myhome/contracts';
import { RMQValidate, RMQRoute, RMQError } from 'nestjs-rmq';
import { UserEnitity } from './entities/user.entity';
import { UserRole } from '@myhome/interfaces';
import { ADMIN_NOT_EXIST, INCORRECT_USER_ROLE, MANAG_COMP_NOT_EXIST, OWNER_NOT_EXIST } from '@myhome/constants';
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
				profile = new UserEnitity(user).getPublicProfile();
				break;
			case UserRole.Owner:
				user = await this.ownerRepository.findUserById(id);
				if (!user) {
					throw new RMQError(OWNER_NOT_EXIST, ERROR_TYPE.RMQ, HttpStatus.NOT_FOUND);
				}
				profile = new UserEnitity(user).getPublicProfile();
				break;
			case UserRole.ManagementCompany:
				user = await this.managementCompanyRepository.findUserById(id);
				if (!user) {
					throw new RMQError(MANAG_COMP_NOT_EXIST, ERROR_TYPE.RMQ, HttpStatus.NOT_FOUND);
				}
				profile = new UserEnitity(user).getPublicProfile();
				break;
			default:
				throw new RMQError(INCORRECT_USER_ROLE, ERROR_TYPE.RMQ, HttpStatus.UNPROCESSABLE_ENTITY);
		}
		return { profile };
	}

}
