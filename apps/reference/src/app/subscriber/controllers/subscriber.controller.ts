import { Body, Controller, HttpStatus } from '@nestjs/common';
import { RMQError, RMQRoute, RMQService, RMQValidate } from 'nestjs-rmq';
import { AccountUsersInfo, ReferenceAddSubscriber, ReferenceGetManagementCompany, ReferenceGetSubscriber, ReferenceGetSubscribers, ReferenceGetSubscribersAllInfo, ReferenceGetSubscribersByHouse, ReferenceUpdateSubscriber } from '@myhome/contracts';
import { SubscriberRepository } from '../repositories/subscriber.repository';
import { SubscriberEntity } from '../entities/subscriber.entity';
import { APARTS_NOT_EXIST, APART_NOT_EXIST, HOUSES_NOT_EXIST, RMQException, SUBSCRIBERS_NOT_EXIST, SUBSCRIBER_ALREADY_ARCHIEVED, SUBSCRIBER_ALREADY_EXIST, SUBSCRIBER_NOT_EXIST } from '@myhome/constants';
import { ApartmentRepository } from '../repositories/apartment.repository';
import { ISubscriberAllInfo, SubscriberStatus, UserRole } from '@myhome/interfaces';
import { ERROR_TYPE } from 'nestjs-rmq/dist/constants';
import { HouseRepository } from '../repositories/house.repository';

@Controller('subscribers')
export class SubscriberController {
	constructor(
		private readonly subscriberRepository: SubscriberRepository,
		private readonly apartmentRepository: ApartmentRepository,
		private readonly houseRepository: HouseRepository,
		private readonly rmqService: RMQService,
	) { }

	@RMQValidate()
	@RMQRoute(ReferenceGetSubscriber.topic)
	async getSubscriber(@Body() { id }: ReferenceGetSubscriber.Request) {
		const subscriber = await this.subscriberRepository.findSubscriberById(id);
		if (!subscriber) {
			throw new RMQError(SUBSCRIBER_NOT_EXIST, ERROR_TYPE.RMQ, HttpStatus.NOT_FOUND);
		}
		const gettedSubscriber = new SubscriberEntity(subscriber).getSubscriber();
		return { subscriber: gettedSubscriber };
	}

	@RMQValidate()
	@RMQRoute(ReferenceAddSubscriber.topic)
	async addSubscriber(@Body() dto: ReferenceAddSubscriber.Request) {
		const newSubscriberEntity = new SubscriberEntity(dto);
		const apartment = await this.apartmentRepository.findApartmentById(dto.apartmentId);
		if (!apartment) {
			throw new RMQError(APART_NOT_EXIST, ERROR_TYPE.RMQ, HttpStatus.NOT_FOUND);
		}
		const existedSubscriber = await this.subscriberRepository.findSubscriberByPersonalAccount(dto.personalAccount);
		if (existedSubscriber) {
			throw new RMQError(SUBSCRIBER_ALREADY_EXIST, ERROR_TYPE.RMQ, HttpStatus.CONFLICT);
		}
		const newSubscriber = await this.subscriberRepository.createSubscriber(newSubscriberEntity);
		return { subscriber: newSubscriber };
	}

	@RMQValidate()
	@RMQRoute(ReferenceUpdateSubscriber.topic)
	async archieveSubscriber(@Body() { id }: ReferenceUpdateSubscriber.Request) {
		const existedSubscriber = await this.subscriberRepository.findSubscriberById(id);
		if (!existedSubscriber) {
			throw new RMQError(SUBSCRIBER_NOT_EXIST, ERROR_TYPE.RMQ, HttpStatus.NOT_FOUND);
		}
		if (existedSubscriber.status === SubscriberStatus.Archieved) {
			throw new RMQError(SUBSCRIBER_ALREADY_ARCHIEVED, ERROR_TYPE.RMQ, HttpStatus.CONFLICT);
		}
		const subscriberEntity = new SubscriberEntity(existedSubscriber).archieveSubscriber();
		return Promise.all([
			this.subscriberRepository.updateSubscriber(subscriberEntity),
		]);
	}

	@RMQValidate()
	@RMQRoute(ReferenceGetManagementCompany.topic)
	async getManagementCompany(@Body() { subscriberId }: ReferenceGetManagementCompany.Request) {
		const subscriber = await this.subscriberRepository.findSubscriberById(subscriberId);
		if (!subscriber) {
			throw new RMQError(SUBSCRIBER_NOT_EXIST, ERROR_TYPE.RMQ, HttpStatus.NOT_FOUND);
		}
		const apartment = await this.apartmentRepository.findApartmentById(subscriber.apartmentId);
		const house = await this.houseRepository.findHouseById(apartment.houseId);
		return house.managementCompanyId;
	}

	@RMQValidate()
	@RMQRoute(ReferenceGetManagementCompany.topic)
	async getHouseBySID(@Body() { subscriberId }: ReferenceGetManagementCompany.Request) {
		const subscriber = await this.subscriberRepository.findSubscriberById(subscriberId);
		if (!subscriber) {
			throw new RMQError(SUBSCRIBER_NOT_EXIST, ERROR_TYPE.RMQ, HttpStatus.NOT_FOUND);
		}
		const apartment = await this.apartmentRepository.findApartmentById(subscriber.apartmentId);
		const house = await this.houseRepository.findHouseById(apartment.houseId);
		return house.managementCompanyId;
	}

	@RMQValidate()
	@RMQRoute(ReferenceGetSubscribersByHouse.topic)
	async getSubscribersByHouse(@Body() { houseId }: ReferenceGetSubscribersByHouse.Request) {
		const apartments = await this.apartmentRepository.findAllByHouse(houseId);
		const apartmentIds = apartments.map(obj => obj.id);
		return { subscriberIds: await this.subscriberRepository.findSubscriberIdsByApartmentIds(apartmentIds) };
	}

	@RMQValidate()
	@RMQRoute(ReferenceGetSubscribers.topic)
	async getSubscribers(@Body() { ids }: ReferenceGetSubscribers.Request) {
		const subscribers = await this.subscriberRepository.findSubscribers(ids);
		if (!subscribers.length) {
			throw new RMQError(SUBSCRIBERS_NOT_EXIST.message, ERROR_TYPE.RMQ, SUBSCRIBERS_NOT_EXIST.status);
		}
		const gettedSubscribers = [];
		for (const subscriber of subscribers) {
			gettedSubscribers.push(new SubscriberEntity(subscriber));
		}
		return { subscribers: gettedSubscribers };
	}

	@RMQValidate()
	@RMQRoute(ReferenceGetSubscribersAllInfo.topic)
	async getSubscribersAllInfo(@Body() { ids }: ReferenceGetSubscribersAllInfo.Request) {
		const subscribers = await this.subscriberRepository.findSubscribers(ids);
		if (!subscribers.length) {
			throw new RMQError(SUBSCRIBERS_NOT_EXIST.message, ERROR_TYPE.RMQ, SUBSCRIBERS_NOT_EXIST.status);
		}

		const apartmentIds = subscribers.map(obj => obj.apartmentId);
		const apartments = await this.apartmentRepository.findApartmentsWithSubscribers(apartmentIds);
		if (!apartments.length) {
			throw new RMQError(APARTS_NOT_EXIST.message, ERROR_TYPE.RMQ, APARTS_NOT_EXIST.status);
		}

		const houseIds = apartments.map(obj => obj.houseId);
		const houses = await this.houseRepository.findHouses(houseIds);
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
