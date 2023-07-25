import { Body, Controller, HttpStatus } from '@nestjs/common';
import { RMQError, RMQRoute, RMQService, RMQValidate } from 'nestjs-rmq';
import { AccountUserInfo, ReferenceAddHouse, ReferenceGetHouse, ReferenceUpdateHouse } from '@myhome/contracts';
import { HouseRepository } from '../repositories/house-tariff.repository';
import { HouseEntity } from '../entities/house-tariff.entity';
import { UserRole } from '@myhome/interfaces';
import { HOME_NOT_EXIST, MANAG_COMP_NOT_EXIST } from '@myhome/constants';
import { ERROR_TYPE } from 'nestjs-rmq/dist/constants';

@Controller()
export class HouseController {
	constructor(
		private readonly houseRepository: HouseRepository,
		private readonly rmqService: RMQService
	) { }

	@RMQValidate()
	@RMQRoute(ReferenceGetHouse.topic)
	async getHouse(@Body() { id }: ReferenceGetHouse.Request) {
		const house = await this.houseRepository.findHouseById(id);
		if (!house) {
			throw new RMQError(HOME_NOT_EXIST, ERROR_TYPE.RMQ, HttpStatus.NOT_FOUND);
		}
		const gettedHouse = new HouseEntity(house).getHouse();
		return { gettedHouse };
	}

	@RMQValidate()
	@RMQRoute(ReferenceAddHouse.topic)
	async addHouse(@Body() dto: ReferenceAddHouse.Request) {
		const newHouseEntity = new HouseEntity(dto);
		await this.checkManagementCompany(dto.managementCompanyId);
		const newHouse = await this.houseRepository.createHouse(newHouseEntity);
		return { newHouse };
	}

	@RMQValidate()
	@RMQRoute(ReferenceUpdateHouse.topic)
	async updateHouse(@Body() { id, managementCompanyId }: ReferenceUpdateHouse.Request) {
		await this.checkManagementCompany(managementCompanyId);
		const existedHouse = await this.houseRepository.findHouseById(id);
		if (!existedHouse) {
			throw new RMQError(HOME_NOT_EXIST, ERROR_TYPE.RMQ, HttpStatus.NOT_FOUND);
		}
		const houseEntity = new HouseEntity(existedHouse).updateHouse(managementCompanyId);
		return Promise.all([
			this.houseRepository.updateHouse(await houseEntity),
		]);
	}

	private async checkManagementCompany(managementCompanyId: number) {
		try {
			await this.rmqService.send
				<
					AccountUserInfo.Request,
					AccountUserInfo.Response
				>
				(AccountUserInfo.topic, { id: managementCompanyId, role: UserRole.ManagementCompany });
		} catch (e) {
			throw new RMQError(MANAG_COMP_NOT_EXIST, ERROR_TYPE.RMQ, HttpStatus.NOT_FOUND);
		}
	}
}
