import { HouseRepository } from '../repositories/house.repository';
import { HouseEntity } from '../entities/house.entity';
import { IHouse, UserRole } from '@myhome/interfaces';
import { HOUSES_NOT_EXIST, HOUSE_NOT_EXIST, RMQException, addGenericObject, checkUser, getGenericObject, getGenericObjects } from '@myhome/constants';
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

	async getHouses(houseIds: number[]) {
		return {
			houses: await getGenericObjects<HouseEntity>
				(
					this.houseRepository,
					(item) => new HouseEntity(item),
					houseIds,
					HOUSES_NOT_EXIST
				)
		};
	}

	async getHousesByMCId(managementCompanyId: number) {
		await checkUser(this.rmqService, managementCompanyId, UserRole.ManagementCompany);
		const houseItems = await this.houseRepository.findManyByMCId(managementCompanyId);
		if (!houseItems.length) {
			throw new RMQException(HOUSES_NOT_EXIST.message, HOUSES_NOT_EXIST.status);
		}
		return { houses: houseItems };
	}

	async addHouse(dto: ReferenceAddHouse.Request) {
		await checkUser(this.rmqService, dto.managementCompanyId, UserRole.ManagementCompany);
		return {
			house: await addGenericObject<HouseEntity>
				(
					this.houseRepository,
					(item) => new HouseEntity(item),
					dto as IHouse
				)
		};
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
