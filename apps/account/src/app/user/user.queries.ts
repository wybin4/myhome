import { AccountUserInfo, AccountUsersInfo, AccountGetOwnersByMCId } from "@myhome/contracts";
import { Controller, Body } from "@nestjs/common";
import { RMQValidate, RMQRoute, RMQError } from "nestjs-rmq";
import { ERROR_TYPE } from "nestjs-rmq/dist/constants";
import { UserService } from "./user.service";

@Controller()
export class UserQueries {
	constructor(
		private readonly userService: UserService,
	) { }

	@RMQValidate()
	@RMQRoute(AccountUserInfo.topic)
	async userInfo(@Body() { id, role }: AccountUserInfo.Request): Promise<AccountUserInfo.Response> {
		try {
			return await this.userService.userInfo(id, role);
		} catch (e) {
			throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
		}
	}

	@RMQValidate()
	@RMQRoute(AccountUsersInfo.topic)
	async usersInfo(@Body() { ids, role }: AccountUsersInfo.Request): Promise<AccountUsersInfo.Response> {
		try {
			return await this.userService.usersInfo(ids, role);
		} catch (e) {
			throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
		}
	}


	@RMQValidate()
	@RMQRoute(AccountGetOwnersByMCId.topic)
	async getOwnersByMCId(@Body() { managementCompanyId }: AccountGetOwnersByMCId.Request) {
		try {
			return await this.userService.getOwnersByMCId(managementCompanyId);
		} catch (e) {
			throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
		}
	}

}
