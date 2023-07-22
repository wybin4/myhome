import { Body, Controller, NotFoundException } from '@nestjs/common';
import { AdminRepository } from './repositories/admin.repository';
import { OwnerRepository } from './repositories/owner.repository';
import { ManagementCompanyRepository } from './repositories/management-company.repository';
import { AccountUserInfo } from '@myhome/contracts';
import { RMQValidate, RMQRoute } from 'nestjs-rmq';
import { Users } from './entities/user.entity';
import { UserRole } from '@myhome/interfaces';
import { ADMIN_NOT_EXIST, INCORRECT_USER_ROLE, MANAG_COMP_NOT_EXIST, OWNER_NOT_EXIST } from '@myhome/constants';

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
					throw new NotFoundException(ADMIN_NOT_EXIST);
				}
				profile = new Users(user).getPublicProfile();
				break;
			case UserRole.Owner:
				user = await this.ownerRepository.findUserById(id);
				if (!user) {
					throw new NotFoundException(OWNER_NOT_EXIST);
				}
				profile = new Users(user).getPublicProfile();
				break;
			case UserRole.ManagementCompany:
				user = await this.managementCompanyRepository.findUserById(id);
				if (!user) {
					throw new NotFoundException(MANAG_COMP_NOT_EXIST);
				}
				profile = new Users(user).getPublicProfile();
				break;
			default:
				throw new Error(INCORRECT_USER_ROLE);
		}
		return { profile };
	}

}
