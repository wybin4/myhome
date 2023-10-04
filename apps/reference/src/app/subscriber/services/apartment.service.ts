import { getGenericObject, APART_NOT_EXIST, RMQException, HOUSE_NOT_EXIST, APART_ALREADY_EXIST, addGenericObject, HOUSES_NOT_EXIST, checkUser } from "@myhome/constants";
import { ReferenceAddApartment, ReferenceGetApartmentsByMCId } from "@myhome/contracts";
import { Injectable, HttpStatus } from "@nestjs/common";
import { ApartmentEntity } from "../entities/apartment.entity";
import { ApartmentRepository } from "../repositories/apartment.repository";
import { HouseRepository } from "../repositories/house.repository";
import { SubscriberRepository } from "../repositories/subscriber.repository";
import { IApartment, UserRole } from "@myhome/interfaces";
import { RMQService } from "nestjs-rmq";

@Injectable()
export class ApartmentService {
	constructor(
		private readonly rmqService: RMQService,
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
		const house = await this.houseRepository.findById(dto.houseId);
		if (!house) {
			throw new RMQException(HOUSE_NOT_EXIST.message(dto.houseId), HOUSE_NOT_EXIST.status);
		}
		const existedApartment = await this.apartmentRepository.findByNumber(dto.apartmentNumber, dto.houseId);
		if (existedApartment) {
			throw new RMQException(APART_ALREADY_EXIST, HttpStatus.CONFLICT);
		}
		return {
			apartment: await addGenericObject<ApartmentEntity>
				(
					this.apartmentRepository,
					(item) => new ApartmentEntity(item),
					dto as IApartment
				)
		};
	}

	async getApartmentsBySubscribers(subscriberIds: number[]) {
		const subscribers = await this.subscriberRepository.findMany(subscriberIds);
		const apartmentIds = subscribers.map(obj => obj.apartmentId);
		return { apartments: await this.apartmentRepository.findWithSubscribers(apartmentIds) };
	}

	async getApartmentsByMCId(managementCompanyId: number):
		Promise<ReferenceGetApartmentsByMCId.Response> {
		await checkUser(this.rmqService, managementCompanyId, UserRole.ManagementCompany);
		const houseItems = await this.houseRepository.findManyByMCId(managementCompanyId);
		if (!houseItems.length) {
			throw new RMQException(HOUSES_NOT_EXIST.message, HOUSES_NOT_EXIST.status);
		}
		const houseIds = houseItems.map(obj => obj.id);

		const apartmentItems = await this.apartmentRepository.findManyByHouses(houseIds);
		return {
			apartments: apartmentItems.map(apartment => {
				const currentHouse = houseItems.find(obj => obj.id === apartment.houseId);
				return {
					...apartment,
					houseName: `${currentHouse.city}, ${currentHouse.street}`,
				};
			})
		};
	}
}
