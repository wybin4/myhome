import { getGenericObject, SUBSCRIBER_NOT_EXIST, RMQException, SUBSCRIBER_ALREADY_EXIST, SUBSCRIBER_ALREADY_ARCHIEVED, SUBSCRIBERS_NOT_EXIST, APARTS_NOT_EXIST, HOUSES_NOT_EXIST, addGenericObject, getGenericObjects, checkUser, checkApartment } from "@myhome/constants";
import { ReferenceAddSubscriber, AccountUsersInfo, ReferenceGetSubscribersByMCId } from "@myhome/contracts";
import { SubscriberStatus, ISubscriberAllInfo, UserRole, ISubscriber } from "@myhome/interfaces";
import { Injectable, HttpStatus } from "@nestjs/common";
import { SubscriberEntity } from "../entities/subscriber.entity";
import { ApartmentRepository } from "../repositories/apartment.repository";
import { HouseRepository } from "../repositories/house.repository";
import { SubscriberRepository } from "../repositories/subscriber.repository";
import { RMQService } from "nestjs-rmq";

@Injectable()
export class SubscriberService {
	constructor(
		readonly subscriberRepository: SubscriberRepository,
		readonly apartmentRepository: ApartmentRepository,
		readonly houseRepository: HouseRepository,
		readonly rmqService: RMQService,
	) { }

	async getSubscriber(id: number) {
		return {
			subscriber: await getGenericObject<SubscriberEntity>
				(
					this.subscriberRepository,
					(item) => new SubscriberEntity(item),
					id,
					SUBSCRIBER_NOT_EXIST
				)
		};
	}

	async addSubscriber(dto: ReferenceAddSubscriber.Request) {
		await checkApartment(this.rmqService, dto.apartmentId);
		await checkUser(this.rmqService, dto.ownerId, UserRole.Owner);
		const existedSubscriber = await this.subscriberRepository.findByPersonalAccount(dto.personalAccount);
		if (existedSubscriber) {
			throw new RMQException(SUBSCRIBER_ALREADY_EXIST, HttpStatus.CONFLICT);
		}
		return {
			subscriber: await addGenericObject<SubscriberEntity>
				(
					this.subscriberRepository,
					(item) => new SubscriberEntity(item),
					dto as ISubscriber
				)
		};
	}

	async archieveSubscriber(id: number) {
		const existedSubscriber = await this.subscriberRepository.findById(id);
		if (!existedSubscriber) {
			throw new RMQException(SUBSCRIBER_NOT_EXIST.message(id), SUBSCRIBER_NOT_EXIST.status);
		}
		if (existedSubscriber.status === SubscriberStatus.Archieved) {
			throw new RMQException(SUBSCRIBER_ALREADY_ARCHIEVED, HttpStatus.CONFLICT);
		}
		const subscriberEntity = new SubscriberEntity(existedSubscriber).archieve();
		return Promise.all([
			this.subscriberRepository.update(subscriberEntity),
		]);
	}

	async getManagementCompany(subscriberId: number) {
		const subscriber = await this.subscriberRepository.findById(subscriberId);
		if (!subscriber) {
			throw new RMQException(SUBSCRIBER_NOT_EXIST.message(subscriberId), SUBSCRIBER_NOT_EXIST.status);
		}
		const apartment = await this.apartmentRepository.findById(subscriber.apartmentId);
		const house = await this.houseRepository.findById(apartment.houseId);
		return house.managementCompanyId;
	}

	async getHouseBySID(subscriberId: number) {
		const subscriber = await this.subscriberRepository.findById(subscriberId);
		if (!subscriber) {
			throw new RMQException(SUBSCRIBER_NOT_EXIST.message(subscriberId), SUBSCRIBER_NOT_EXIST.status);
		}
		const apartment = await this.apartmentRepository.findById(subscriber.apartmentId);
		const house = await this.houseRepository.findById(apartment.houseId);
		return house.managementCompanyId;
	}

	async getSubscribersByHouse(houseId: number) {
		const apartments = await this.apartmentRepository.findManyByHouse(houseId);
		const apartmentIds = apartments.map(obj => obj.id);
		return { subscriberIds: await this.subscriberRepository.findIdsByApartmentIds(apartmentIds) };
	}

	async getSubscribers(ids: number[]) {
		return {
			subscribers: await getGenericObjects<SubscriberEntity>
				(
					this.subscriberRepository,
					(item) => new SubscriberEntity(item),
					ids,
					SUBSCRIBERS_NOT_EXIST
				)
		};
	}

	async getSubscribersAllInfo(ids: number[]) {
		const subscribers = await this.subscriberRepository.findMany(ids);
		if (!subscribers.length) {
			throw new RMQException(SUBSCRIBERS_NOT_EXIST.message, SUBSCRIBERS_NOT_EXIST.status);
		}

		const apartmentIds = subscribers.map(obj => obj.apartmentId);
		const apartments = await this.apartmentRepository.findWithSubscribers(apartmentIds);
		if (!apartments.length) {
			throw new RMQException(APARTS_NOT_EXIST.message, APARTS_NOT_EXIST.status);
		}

		const houseIds = apartments.map(obj => obj.houseId);
		const houses = await this.houseRepository.findMany(houseIds);
		if (!houses.length) {
			throw new RMQException(HOUSES_NOT_EXIST.message, HOUSES_NOT_EXIST.status);
		}

		const ownerIds = subscribers.map(obj => obj.ownerId);
		const { profiles: owners } = await this.getOwners(ownerIds);

		const subscribersInfo: ISubscriberAllInfo[] = [];

		for (const subscriber of subscribers) {
			const currentApart = apartments.find(obj => obj.id === subscriber.apartmentId);
			const currentOwner = owners.find(obj => obj.id === subscriber.ownerId);
			const currentHouse = houses.find(obj => obj.id === currentApart.houseId);

			subscribersInfo.push({
				id: subscriber.id,
				name: currentOwner.name,
				address: currentHouse.street + ', дом № ' + currentHouse.houseNumber + ', кв. ' + currentApart.apartmentNumber,
				personalAccount: subscriber.personalAccount,
				apartmentArea: currentApart.totalArea,
				livingArea: currentApart.livingArea,
				numberOfRegistered: currentApart.numberOfRegistered
			});
		}

		return { subscribers: subscribersInfo };
	}

	private async getOwnerIdsByMCId(managementCompanyId: number) {
		const houseItems = await this.houseRepository.findManyByMCId(managementCompanyId);
		if (!houseItems.length) {
			throw new RMQException(HOUSES_NOT_EXIST.message, HOUSES_NOT_EXIST.status);
		}
		const houseIds = houseItems.map(obj => obj.id);

		const apartmentItems = await this.apartmentRepository.findManyByHouses(houseIds);
		const apartmentIds = apartmentItems.map(obj => obj.id);

		const subscriberItems = await this.subscriberRepository.findManyByApartmentIds(apartmentIds);
		return {
			houseItems,
			apartmentItems,
			subscriberItems,
			ownerIds: subscriberItems.map(obj => obj.ownerId),
		};
	}

	async getOwnersByMCId(managementCompanyId: number) {
		const { ownerIds } = await this.getOwnerIdsByMCId(managementCompanyId);
		return { ownerIds: ownerIds }
	}

	async getSubscribersByMCId(managementCompanyId: number):
		Promise<ReferenceGetSubscribersByMCId.Response> {
		await checkUser(this.rmqService, managementCompanyId, UserRole.ManagementCompany);

		const { houseItems, apartmentItems, subscriberItems, ownerIds } = await this.getOwnerIdsByMCId(managementCompanyId);
		const { profiles: ownerItems } = await this.getOwners(ownerIds);

		return {
			subscribers: subscriberItems.map(subscriber => {
				const currentApart = apartmentItems.find(obj => obj.id === subscriber.apartmentId);
				const currentOwner = ownerItems.find(obj => obj.id === subscriber.ownerId);
				const currentHouse = houseItems.find(obj => obj.id === currentApart.houseId);
				const houseName = `${currentHouse.city}, ${currentHouse.street} ${currentHouse.houseNumber}`;
				return {
					...subscriber,
					ownerName: currentOwner.name,
					houseId: currentHouse.id,
					houseName,
					apartmentName: `${houseName}, кв. ${currentApart.apartmentNumber}`
				};
			})
		};
	}

	private async getOwners(ownerIds: number[]) {
		try {
			return await this.rmqService.send
				<
					AccountUsersInfo.Request,
					AccountUsersInfo.Response
				>
				(AccountUsersInfo.topic, { ids: ownerIds, role: UserRole.Owner });
		} catch (e) {
			throw new RMQException(e.message, e.status);
		}
	}

}