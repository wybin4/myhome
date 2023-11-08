import { HouseRepository } from '../repositories/house.repository';
import { HouseEntity } from '../entities/house.entity';
import { IHouse, UserRole } from '@myhome/interfaces';
import { HOUSES_NOT_EXIST, RMQException, addGenericObject, checkMCIds, checkUser, getGenericObjects } from '@myhome/constants';
import { ReferenceAddHouse, ReferenceGetHouses, ReferenceGetHousesByUser } from '@myhome/contracts';
import { Injectable } from '@nestjs/common';
import { RMQService } from 'nestjs-rmq';

@Injectable()
export class HouseService {
	constructor(
		private readonly houseRepository: HouseRepository,
		private readonly rmqService: RMQService
	) { }

	async getHouses(dto: ReferenceGetHouses.Request): Promise<ReferenceGetHouses.Response> {
		if (dto.isAllInfo) {
			const houses = await this.houseRepository.findWithSubscribers(dto.houseIds);
			if (!houses) { return; }
			const mcIds = Array.from(new Set(houses.map(h => h.managementCompanyId)));
			const { profiles } = await checkMCIds(this.rmqService, mcIds);
			return {
				houses: houses.map(house => {
					const currentMc = profiles.find(p => p.id === house.managementCompanyId);
					return {
						managementCompanyName: currentMc.name,
						ownerIds: house.apartments.map(a => a.subscriber.ownerId),
						...house.get()
					};
				})
			}
		} else {
			return {
				houses: await getGenericObjects<HouseEntity>
					(
						this.houseRepository,
						(item) => new HouseEntity(item),
						dto.houseIds,
						HOUSES_NOT_EXIST
					)
			};
		}
	}

	async getHousesByUser(dto: ReferenceGetHousesByUser.Request): Promise<ReferenceGetHousesByUser.Response> {
		const houseItems = await this.houseRepository.findByUser(dto.userId, dto.userRole);
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

	public getAddress(house: IHouse, withCity = true): string {
		if (withCity) {
			return `${house.city}, ${house.street} ${house.houseNumber}`;
		} else {
			return `${house.street} д. ${house.houseNumber}`;
		}
	}

}
