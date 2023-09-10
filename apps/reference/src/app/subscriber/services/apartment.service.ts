import { getGenericObject, APART_NOT_EXIST, RMQException, HOUSE_NOT_EXIST, APART_ALREADY_EXIST } from "@myhome/constants";
import { ReferenceAddApartment } from "@myhome/contracts";
import { Injectable, HttpStatus } from "@nestjs/common";
import { RMQError } from "nestjs-rmq";
import { ERROR_TYPE } from "nestjs-rmq/dist/constants";
import { ApartmentEntity } from "../entities/apartment.entity";
import { ApartmentRepository } from "../repositories/apartment.repository";
import { HouseRepository } from "../repositories/house.repository";
import { SubscriberRepository } from "../repositories/subscriber.repository";

@Injectable()
export class ApartmentService {
	constructor(
		private readonly apartmentRepository: ApartmentRepository,
		private readonly houseRepository: HouseRepository,
		private readonly subscriberRepository: SubscriberRepository
	) { }

	async getApartment(id: number) {
		return {
			apartment: await getGenericObject<ApartmentEntity>
				(
					this.apartmentRepository,
					(item) => new ApartmentEntity(item),
					id,
					APART_NOT_EXIST
				)
		};
	}

	async addApartment(dto: ReferenceAddApartment.Request) {
		const newApartmentEntity = new ApartmentEntity(dto);
		const house = await this.houseRepository.findById(dto.houseId);
		if (!house) {
			throw new RMQException(HOUSE_NOT_EXIST.message(dto.houseId), HOUSE_NOT_EXIST.status);
		}
		const existedApartment = await this.apartmentRepository.findByNumber(dto.apartmentNumber, dto.houseId);
		if (existedApartment) {
			throw new RMQError(APART_ALREADY_EXIST, ERROR_TYPE.RMQ, HttpStatus.CONFLICT);
		}
		const newApartment = await this.apartmentRepository.create(newApartmentEntity);
		return { apartment: newApartment };
	}


	async getApartmentsBySubscribers(subscriberIds: number[]) {
		const subscribers = await this.subscriberRepository.findMany(subscriberIds);
		const apartmentIds = subscribers.map(obj => obj.apartmentId);
		return { apartments: await this.apartmentRepository.findWithSubscribers(apartmentIds) };
	}
}
