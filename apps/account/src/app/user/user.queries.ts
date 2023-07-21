import { Body, Controller } from '@nestjs/common';
import { AccountUserInfo } from '@myhome/contracts';
import { RMQRoute, RMQValidate } from 'nestjs-rmq';
import { UserRepository } from './repositories/user.repository';
import { Users } from './entities/user.entity';

@Controller()
export class UserQueries {
	constructor(private readonly userRepository: UserRepository) { }

	@RMQValidate()
	@RMQRoute(AccountUserInfo.topic)
	async userInfo(@Body() { id }: AccountUserInfo.Request): Promise<AccountUserInfo.Response> {
		const user = await this.userRepository.findUserById(id);
		const profile = new Users(user).getPublicProfile();
		return { profile };
	}

}
