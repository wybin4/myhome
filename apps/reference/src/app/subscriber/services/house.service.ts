import { HouseRepository } from '../repositories/house.repository';
import { HouseEntity } from '../entities/house.entity';
import { UserRole } from '@myhome/interfaces';
import { HOUSE_NOT_EXIST, RMQException, checkUser, getGenericObject } from '@myhome/constants';
import { ReferenceAddHouse } from '@myhome/contracts';
import { Injectable } from '@nestjs/common';
import { RMQService } from 'nestjs-rmq';

@Injectable()
export class HouseService {
	constructor(
		private readonly houseRepository: HouseRepository,
		private readonly rmqService: RMQService
	) { }

	async getHouse(id: number) {
		return {
			house: await getGenericObject<HouseEntity>
				(
					this.houseRepository,
					(item) => new HouseEntity(item),
					id,
					HOUSE_NOT_EXIST
				)
		};
	}

	async addHouse(dto: ReferenceAddHouse.Request) {
		const newHouseEntity = new HouseEntity(dto);
		await checkUser(this.rmqService, dto.managementCompanyId, UserRole.ManagementCompany);
		const newHouse = await this.houseRepository.create(newHouseEntity);
		return { house: newHouse };
	}

	async updateHouse(id: number, managementCompanyId: number) {
		await checkUser(this.rmqService, managementCompanyId, UserRole.ManagementCompany);
		const existedHouse = await this.houseRepository.findById(id);
		if (!existedHouse) {
			throw new RMQException(HOUSE_NOT_EXIST.message(id), HOUSE_NOT_EXIST.status);
		}
		const houseEntity = new HouseEntity(existedHouse).update(managementCompanyId);
		return {
			house: Promise.all([
				this.houseRepository.update(await houseEntity),
			])
		};
	}
}
