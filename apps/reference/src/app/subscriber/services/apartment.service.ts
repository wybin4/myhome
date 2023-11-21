import { RMQException, APART_ALREADY_EXIST, addGenericObject, checkUser, getGenericObjects, APARTS_NOT_EXIST, HOUSE_NOT_EXIST } from "@myhome/constants";
import { ReferenceAddApartment, ReferenceGetApartmentsByUser, ReferenceGetApartmentsBySubscribers, ReferenceGetApartments, IGetApartmentAllInfo } from "@myhome/contracts";
import { Injectable, HttpStatus } from "@nestjs/common";
import { ApartmentEntity } from "../entities/apartment.entity";
import { ApartmentRepository } from "../repositories/apartment.repository";
import { IApartment, UserRole } from "@myhome/interfaces";
import { RMQService } from "nestjs-rmq";
import { HouseRepository } from "../repositories/house.repository";

@Injectable()
export class ApartmentService {
	constructor(
		private readonly rmqService: RMQService,
		private readonly apartmentRepository: ApartmentRepository,
		private readonly houseRepository: HouseRepository
	) { }

	async addApartment(dto: ReferenceAddApartment.Request): Promise<ReferenceAddApartment.Response> {
		const existedApartment = await this.apartmentRepository.findByNumber(dto.apartmentNumber, dto.houseId);
		if (existedApartment) {
			throw new RMQException(APART_ALREADY_EXIST, HttpStatus.CONFLICT);
		}
		const house = await this.houseRepository.findById(dto.houseId);
		if (!house) {
			throw new RMQException(HOUSE_NOT_EXIST.message(dto.houseId), HOUSE_NOT_EXIST.status);
		}

		const newApartment = await addGenericObject<ApartmentEntity>
			(
				this.apartmentRepository,
				(item) => new ApartmentEntity(item),
				dto as IApartment
			);

		return {
			apartment: {
				...newApartment,
				name: house.getAddress()
			}
		};
	}

	async getApartmentsBySubscribers(dto: ReferenceGetApartmentsBySubscribers.Request):
		Promise<ReferenceGetApartmentsBySubscribers.Response> {
		if (dto.isAllInfo) {
			const apartments = await this.apartmentRepository.findWithSubscribersAndHouse(dto.subscriberIds);

			return {
				apartments: apartments.map((apartment) => {
					const currentHouse = apartment.house;
					const currentSubscriber = apartment.subscriber;
					return {
						...apartment.get(),
						subscriberId: currentSubscriber.id,
						address: apartment.getAddress(currentHouse)
					};
				})
			};
		}
		else {
			const apartments = await this.apartmentRepository.findWithSubscribers(dto.subscriberIds);

			return {
				apartments: apartments.map((apartment) => {
					return {
						...apartment,
					};
				})
			};
		}
	}

	async getApartmentsByUser({ userId, userRole, isAllInfo }: ReferenceGetApartmentsByUser.Request): Promise<ReferenceGetApartmentsByUser.Response> {
		if (isAllInfo) {
			const apartments = await this.apartmentRepository.findByUserAll(userId, userRole);

			return {
				apartments: apartments.map(apartment => {
					const currentHouse = apartment.house;
					switch (userRole) {
						case UserRole.ManagementCompany:
							return {
								...apartment.get(),
								subscriberId: 0,
								address: currentHouse.getAddress(),
							};
						case UserRole.Owner:
							return {
								...apartment.get(),
								subscriberId: apartment.subscriber.id,
								address: apartment.getAddress(currentHouse),
							};
					}
				})
			};
		} else {
			const { profile } = await checkUser(this.rmqService, userId, userRole);
			const apartments = await this.apartmentRepository.findByUser(userId, userRole);

			return {
				apartments: apartments.map(apartment => {
					switch (userRole) {
						case UserRole.ManagementCompany:
							return {
								...apartment.get(),
								name: apartment.getAddress(apartment.house),
							};
						case UserRole.Owner:
							return {
								...apartment.get(),
								name: profile.name,
							};
					}
				})
			};
		}
	}

	async getApartments(ids: number[]): Promise<ReferenceGetApartments.Response> {
		return {
			apartments: await getGenericObjects<ApartmentEntity>
				(
					this.apartmentRepository,
					(item) => new ApartmentEntity(item),
					ids,
					APARTS_NOT_EXIST
				)
		};
	}

	async getApartmentsAllInfo(subscriberIds: number[]) {
		const { apartments } = await this.getApartmentsBySubscribers({
			subscriberIds: subscriberIds,
			isAllInfo: true
		});
		return { apartments: apartments as IGetApartmentAllInfo[] };
	}
}
