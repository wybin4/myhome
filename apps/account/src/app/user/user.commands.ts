import { Controller, Body } from '@nestjs/common';
// import { AccountChangeProfile } from '@myhome/contracts';
// import { RMQValidate, RMQRoute } from 'nestjs-rmq';
// import { UserService } from './user.service';

@Controller()
export class UserCommands {
	// constructor(
	// 	// private readonly userService: UserService
	// ) { }

	// @RMQValidate()
	// @RMQRoute(AccountChangeProfile.topic)
	// async changeProfile(@Body() { user, id }: AccountChangeProfile.Request): Promise<AccountChangeProfile.Response> {
	// 	return this.userService.changeProfile(user, id);
	// }
}
