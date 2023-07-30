import { Body, Controller, HttpStatus } from '@nestjs/common';
import { RMQError, RMQRoute, RMQValidate } from 'nestjs-rmq';
import { ReferenceAddSubscriber, ReferenceGetManagementCompany, ReferenceGetSubscriber, ReferenceUpdateSubscriber } from '@myhome/contracts';
import { SubscriberRepository } from '../repositories/subscriber.repository';
import { SubscriberEntity } from '../entities/subscriber.entity';
import { APART_NOT_EXIST, SUBSCRIBER_ALREADY_ARCHIEVED, SUBSCRIBER_ALREADY_EXIST, SUBSCRIBER_NOT_EXIST } from '@myhome/constants';
import { ApartmentRepository } from '../repositories/apartment.repository';
import { SubscriberStatus } from '@myhome/interfaces';
import { ERROR_TYPE } from 'nestjs-rmq/dist/constants';
import { HouseRepository } from '../repositories/house.repository';

@Controller()
export class SubscriberController {
	constructor(
		private readonly subscriberRepository: SubscriberRepository,
		private readonly apartmentRepository: ApartmentRepository,
		private readonly houseRepository: HouseRepository,
	) { }

	@RMQValidate()
	@RMQRoute(ReferenceGetSubscriber.topic)
	async getSubscriber(@Body() { id }: ReferenceGetSubscriber.Request) {
		const subscriber = await this.subscriberRepository.findSubscriberById(id);
		if (!subscriber) {
			throw new RMQError(SUBSCRIBER_NOT_EXIST, ERROR_TYPE.RMQ, HttpStatus.NOT_FOUND);
		}
		const gettedSubscriber = new SubscriberEntity(subscriber).getSubscriber();
		return { gettedSubscriber };
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
		return { newSubscriber };
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
}
