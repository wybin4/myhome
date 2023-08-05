import { Body, Controller, HttpStatus } from '@nestjs/common';
import { RMQError, RMQRoute, RMQValidate } from 'nestjs-rmq';
import { ReferenceAddApartment, ReferenceGetApartment, ReferenceGetApartmentsBySubscribers } from '@myhome/contracts';
import { ApartmentRepository } from '../repositories/apartment.repository';
import { ApartmentEntity } from '../entities/apartment.entity';
import { HouseRepository } from '../repositories/house.repository';
import { APART_ALREADY_EXIST, APART_NOT_EXIST, HOME_NOT_EXIST } from '@myhome/constants';
import { ERROR_TYPE } from 'nestjs-rmq/dist/constants';
import { SubscriberRepository } from '../repositories/subscriber.repository';

@Controller()
export class ApartmentController {
	constructor(
		private readonly apartmentRepository: ApartmentRepository,
		private readonly houseRepository: HouseRepository,
		private readonly subscriberRepository: SubscriberRepository
	) { }

	@RMQValidate()
	@RMQRoute(ReferenceGetApartment.topic)
	async getApartment(@Body() { id }: ReferenceGetApartment.Request) {
		const apartment = await this.apartmentRepository.findApartmentById(id);
		if (!apartment) {
			throw new RMQError(APART_NOT_EXIST, ERROR_TYPE.RMQ, HttpStatus.NOT_FOUND);
		}
		const gettedApartment = new ApartmentEntity(apartment).getApartment();
		return { gettedApartment };
	}

	@RMQValidate()
	@RMQRoute(ReferenceAddApartment.topic)
	async addApartment(@Body() dto: ReferenceAddApartment.Request) {
		const newApartmentEntity = new ApartmentEntity(dto);
		const house = await this.houseRepository.findHouseById(dto.houseId);
		if (!house) {
			throw new RMQError(HOME_NOT_EXIST, ERROR_TYPE.RMQ, HttpStatus.NOT_FOUND);
		}
		const existedApartment = await this.apartmentRepository.findApartmentByNumber(dto.apartmentNumber, dto.houseId);
		if (existedApartment) {
			throw new RMQError(APART_ALREADY_EXIST, ERROR_TYPE.RMQ, HttpStatus.CONFLICT);
		}
		const newApartment = await this.apartmentRepository.createApartment(newApartmentEntity);
		return { newApartment };
	}


	@RMQValidate()
	@RMQRoute(ReferenceGetApartmentsBySubscribers.topic)
	async getApartmentsBySubscribers(@Body() { subscriberIds }: ReferenceGetApartmentsBySubscribers.Request) {
		const subscribers = await this.subscriberRepository.findSubscribers(subscriberIds);
		const apartmentIds = subscribers.map(obj => obj.apartmentId);
		return { apartments: await this.apartmentRepository.findApartmentsWithSubscribers(apartmentIds) };
	}
}
