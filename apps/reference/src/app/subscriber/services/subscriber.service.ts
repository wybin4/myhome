import { getGenericObject, SUBSCRIBER_NOT_EXIST, RMQException, APART_NOT_EXIST, SUBSCRIBER_ALREADY_EXIST, SUBSCRIBER_ALREADY_ARCHIEVED, SUBSCRIBERS_NOT_EXIST, APARTS_NOT_EXIST, HOUSES_NOT_EXIST } from "@myhome/constants";
import { ReferenceAddSubscriber, AccountUsersInfo } from "@myhome/contracts";
import { SubscriberStatus, ISubscriberAllInfo, UserRole } from "@myhome/interfaces";
import { Injectable, HttpStatus } from "@nestjs/common";
import { RMQService, RMQError } from "nestjs-rmq";
import { ERROR_TYPE } from "nestjs-rmq/dist/constants";
import { SubscriberEntity } from "../entities/subscriber.entity";
import { ApartmentRepository } from "../repositories/apartment.repository";
import { HouseRepository } from "../repositories/house.repository";
import { SubscriberRepository } from "../repositories/subscriber.repository";

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
		const newSubscriberEntity = new SubscriberEntity(dto);
		const apartment = await this.apartmentRepository.findById(dto.apartmentId);
		if (!apartment) {
			throw new RMQException(APART_NOT_EXIST.message(dto.apartmentId), APART_NOT_EXIST.status);
		}
		const existedSubscriber = await this.subscriberRepository.findByPersonalAccount(dto.personalAccount);
		if (existedSubscriber) {
			throw new RMQError(SUBSCRIBER_ALREADY_EXIST, ERROR_TYPE.RMQ, HttpStatus.CONFLICT);
		}
		const newSubscriber = await this.subscriberRepository.create(newSubscriberEntity);
		return { subscriber: newSubscriber };
	}

	async archieveSubscriber(id: number) {
		const existedSubscriber = await this.subscriberRepository.findById(id);
		if (!existedSubscriber) {
			throw new RMQException(SUBSCRIBER_NOT_EXIST.message(id), SUBSCRIBER_NOT_EXIST.status);
		}
		if (existedSubscriber.status === SubscriberStatus.Archieved) {
			throw new RMQError(SUBSCRIBER_ALREADY_ARCHIEVED, ERROR_TYPE.RMQ, HttpStatus.CONFLICT);
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
		const apartments = await this.apartmentRepository.findAllByHouse(houseId);
		const apartmentIds = apartments.map(obj => obj.id);
		return { subscriberIds: await this.subscriberRepository.findIdsByApartmentIds(apartmentIds) };
	}

	async getSubscribers(ids: number[]) {
		const subscribers = await this.subscriberRepository.findMany(ids);
		if (!subscribers.length) {
			throw new RMQError(SUBSCRIBERS_NOT_EXIST.message, ERROR_TYPE.RMQ, SUBSCRIBERS_NOT_EXIST.status);
		}
		const gettedSubscribers = [];
		for (const subscriber of subscribers) {
			gettedSubscribers.push(new SubscriberEntity(subscriber));
		}
		return { subscribers: gettedSubscribers };
	}

	async getSubscribersAllInfo(ids: number[]) {
		const subscribers = await this.subscriberRepository.findMany(ids);
		if (!subscribers.length) {
			throw new RMQError(SUBSCRIBERS_NOT_EXIST.message, ERROR_TYPE.RMQ, SUBSCRIBERS_NOT_EXIST.status);
		}

		const apartmentIds = subscribers.map(obj => obj.apartmentId);
		const apartments = await this.apartmentRepository.findWithSubscribers(apartmentIds);
		if (!apartments.length) {
			throw new RMQError(APARTS_NOT_EXIST.message, ERROR_TYPE.RMQ, APARTS_NOT_EXIST.status);
		}

		const houseIds = apartments.map(obj => obj.houseId);
		const houses = await this.houseRepository.findMany(houseIds);
		if (!houses.length) {
			throw new RMQError(HOUSES_NOT_EXIST.message, ERROR_TYPE.RMQ, HOUSES_NOT_EXIST.status);
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

	async getOwners(ownerIds: number[]) {
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