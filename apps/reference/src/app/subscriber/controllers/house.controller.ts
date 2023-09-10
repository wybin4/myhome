import { Body, Controller, HttpStatus } from '@nestjs/common';
import { RMQError, RMQRoute, RMQService, RMQValidate } from 'nestjs-rmq';
import { ReferenceAddHouse, ReferenceGetHouse, ReferenceUpdateHouse } from '@myhome/contracts';
import { HouseRepository } from '../repositories/house.repository';
import { HouseEntity } from '../entities/house.entity';
import { UserRole } from '@myhome/interfaces';
import { HOME_NOT_EXIST, checkUser } from '@myhome/constants';
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
		return { house: gettedHouse };
	}

	@RMQValidate()
	@RMQRoute(ReferenceAddHouse.topic)
	async addHouse(@Body() dto: ReferenceAddHouse.Request) {
		const newHouseEntity = new HouseEntity(dto);
		await checkUser(this.rmqService, dto.managementCompanyId, UserRole.ManagementCompany);
		const newHouse = await this.houseRepository.createHouse(newHouseEntity);
		return { house: newHouse };
	}

	@RMQValidate()
	@RMQRoute(ReferenceUpdateHouse.topic)
	async updateHouse(@Body() { id, managementCompanyId }: ReferenceUpdateHouse.Request) {
		await checkUser(this.rmqService, managementCompanyId, UserRole.ManagementCompany);
		const existedHouse = await this.houseRepository.findHouseById(id);
		if (!existedHouse) {
			throw new RMQError(HOME_NOT_EXIST, ERROR_TYPE.RMQ, HttpStatus.NOT_FOUND);
		}
		const houseEntity = new HouseEntity(existedHouse).updateHouse(managementCompanyId);
		return Promise.all([
			this.houseRepository.updateHouse(await houseEntity),
		]);
	}
}
