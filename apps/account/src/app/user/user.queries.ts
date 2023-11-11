import { AccountUserInfo, AccountUsersInfo, AccountGetUsersByAnotherRole, AccountGetAllUsers } from "@myhome/contracts";
import { Controller, Body } from "@nestjs/common";
import { RMQValidate, RMQRoute, RMQError } from "nestjs-rmq";
import { ERROR_TYPE } from "nestjs-rmq/dist/constants";
import { UserService } from "./user.service";

@Controller("user")
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
	@RMQRoute(AccountGetUsersByAnotherRole.topic)
	async getUsersByAnotherRole(@Body() dto: AccountGetUsersByAnotherRole.Request) {
		try {
			return await this.userService.getUsersByAnotherRole(dto);
		} catch (e) {
			throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
		}
	}

	@RMQValidate()
	@RMQRoute(AccountGetAllUsers.topic)
	async getAllUsers(@Body() dto: AccountGetAllUsers.Request) {
		try {
			return await this.userService.getAllUsers(dto);
		} catch (e) {
			throw new RMQError(e.message, ERROR_TYPE.RMQ, e.status);
		}
	}

}
