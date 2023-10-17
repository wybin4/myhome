import { getGenericObject, APART_NOT_EXIST, RMQException, APART_ALREADY_EXIST, addGenericObject, checkUser } from "@myhome/constants";
import { ReferenceAddApartment, ReferenceGetApartmentsAllInfo, ReferenceGetApartmentsByMCId, ReferenceGetApartmentsBySubscribers } from "@myhome/contracts";
import { Injectable, HttpStatus } from "@nestjs/common";
import { ApartmentEntity } from "../entities/apartment.entity";
import { ApartmentRepository } from "../repositories/apartment.repository";
import { IApartment, UserRole } from "@myhome/interfaces";
import { RMQService } from "nestjs-rmq";

@Injectable()
export class ApartmentService {
	constructor(
		private readonly rmqService: RMQService,
		private readonly apartmentRepository: ApartmentRepository
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

	async getApartmentsAllInfo(subscriberIds: number[]): Promise<ReferenceGetApartmentsAllInfo.Response> {
		const apartments = await this.apartmentRepository.findWithSubscribersAndHouse(subscriberIds);

		return {
			apartments: apartments.map((apartment) => {
				const currentHouse = apartment.house;
				const currentSubscriber = apartment.subscriber;
				return {
					...apartment.get(),
					subscriberId: currentSubscriber.id,
					address: `${currentHouse.getAddress()}, кв. ${apartment.apartmentNumber}`
				};
			})
		};
	}

	async getApartmentsBySubscribers(subscriberIds: number[]): Promise<ReferenceGetApartmentsBySubscribers.Response> {
		const apartments = await this.apartmentRepository.findWithSubscribers(subscriberIds);

		return {
			apartments: apartments.map((apartment) => {
				return {
					...apartment,
				};
			})
		};
	}

	async getApartmentsByMCId(managementCompanyId: number): Promise<ReferenceGetApartmentsByMCId.Response> {
		await checkUser(this.rmqService, managementCompanyId, UserRole.ManagementCompany);
		const apartments = await this.apartmentRepository.findByMCId(managementCompanyId);

		return {
			apartments: apartments.map(apartment => {
				return {
					...apartment.get(),
					houseName: apartment.house.getAddress(),
				};
			})
		};
	}
}
