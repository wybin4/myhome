import { Body, Controller } from '@nestjs/common';
import { RMQRoute, RMQValidate } from 'nestjs-rmq';
import { ReferenceAddHouse, ReferenceGetHouse, ReferenceUpdateHouse } from '@myhome/contracts';
import { HouseRepository } from '../repositories/house.repository';
import { Houses } from '../entities/house.entity';
@Controller()
export class HouseController {
	constructor(
		private readonly houseRepository: HouseRepository,
	) { }

	@RMQValidate()
	@RMQRoute(ReferenceGetHouse.topic)
	async getHouse(@Body() { id }: ReferenceGetHouse.Request) {
		const house = await this.houseRepository.findHouseById(id);
		const gettedHouse = new Houses(house).getHouse();
		return { gettedHouse };
	}

	@RMQValidate()
	@RMQRoute(ReferenceAddHouse.topic)
	async addHouse(@Body() dto: ReferenceAddHouse.Request) {
		const newHouseEntity = new Houses(dto);
		const newHouse = await this.houseRepository.createHouse(newHouseEntity);
		return { newHouse };
	}

	@RMQValidate()
	@RMQRoute(ReferenceUpdateHouse.topic)
	async updateHouse(@Body() { id, managementCompanyId }: ReferenceUpdateHouse.Request) {
		const existedHouse = await this.houseRepository.findHouseById(id);
		if (!existedHouse) {
			throw new Error('Такого дома не существует');
		}
		const userEntity = new Houses(existedHouse).updateHouse(managementCompanyId);
		return this.updateHouse(await userEntity);
	}

}
