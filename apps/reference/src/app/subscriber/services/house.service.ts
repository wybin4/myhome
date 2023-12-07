import { HouseRepository } from '../repositories/house.repository';
import { HouseEntity } from '../entities/house.entity';
import { IHouse } from '@myhome/interfaces';
import { HOUSES_NOT_EXIST, RMQException, checkMCIds, getGenericObjects } from '@myhome/constants';
import { ReferenceAddHouses, ReferenceGetHouses, ReferenceGetHousesByUser } from '@myhome/contracts';
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
		if (dto.isAllInfo) {
			const houseItems = await this.houseRepository.findByUser(dto.userId, dto.userRole);
			if (!houseItems.length) {
				throw new RMQException(HOUSES_NOT_EXIST.message, HOUSES_NOT_EXIST.status);
			}
			return {
				houses: houseItems.map(house => {
					return {
						...house,
						name: house.getAddress()
					};
				})
			};
		} else {
			const houseItems = await this.houseRepository.findByUser(dto.userId, dto.userRole);
			if (!houseItems.length) {
				throw new RMQException(HOUSES_NOT_EXIST.message, HOUSES_NOT_EXIST.status);
			}
			return { houses: houseItems };
		}
	}

	async addHouses(dto: ReferenceAddHouses.Request): Promise<ReferenceAddHouses.Response> {
		const newEntities = dto.houses.map(d => new HouseEntity({ ...d, managementCompanyId: dto.managementCompanyId }));
		const news = await this.houseRepository.createMany(newEntities);

		return { houses: news.map(n => n.get()) };
	}

	public getAddress(house: IHouse, withCity = true): string {
		if (withCity) {
			return `${house.city}, ${house.street} ${house.houseNumber}`;
		} else {
			return `${house.street} д. ${house.houseNumber}`;
		}
	}

}
