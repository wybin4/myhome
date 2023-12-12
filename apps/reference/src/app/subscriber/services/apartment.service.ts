import { RMQException, checkUser, getGenericObjects, APARTS_NOT_EXIST, APARTS_ALREADY_EXISTS, HOUSES_NOT_EXIST } from "@myhome/constants";
import { ReferenceGetApartmentsByUser, ReferenceGetApartmentsBySubscribers, ReferenceGetApartments, IGetApartmentAllInfo, ReferenceAddApartments } from "@myhome/contracts";
import { Injectable } from "@nestjs/common";
import { ApartmentEntity } from "../entities/apartment.entity";
import { ApartmentRepository } from "../repositories/apartment.repository";
import { UserRole } from "@myhome/interfaces";
import { RMQService } from "nestjs-rmq";
import { HouseRepository } from "../repositories/house.repository";

@Injectable()
export class ApartmentService {
	constructor(
		private readonly rmqService: RMQService,
		private readonly apartmentRepository: ApartmentRepository,
		private readonly houseRepository: HouseRepository
	) { }

	async addApartments(dto: ReferenceAddApartments.Request): Promise<ReferenceAddApartments.Response> {
		const existedApartment = await this.apartmentRepository.findByNumber(dto.apartments.map(a => {
			return {
				houseId: a.houseId,
				apatNumber: a.apartmentNumber
			};
		}));
		if (existedApartment.length) {
			throw new RMQException(APARTS_ALREADY_EXISTS.message, APARTS_ALREADY_EXISTS.status);
		}
		const houses = await this.houseRepository.findMany(dto.apartments.map(a => a.houseId));
		if (!houses.length) {
			throw new RMQException(HOUSES_NOT_EXIST.message, HOUSES_NOT_EXIST.status);
		}

		const newEntities = dto.apartments.map(a => new ApartmentEntity(a));
		const news = await this.apartmentRepository.createMany(newEntities);

		return {
			apartments: news.map(a => {
				const currentHouse = houses.find(h => h.id === a.houseId);
				return {
					...a,
					name: currentHouse.getAddress()
				};
			})
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

	async getApartmentsByUser({ userId, userRole, isAllInfo, meta }: ReferenceGetApartmentsByUser.Request): Promise<ReferenceGetApartmentsByUser.Response> {
		if (isAllInfo) {
			const { apartments, totalCount } = await this.apartmentRepository.findByUserAll(userId, userRole, meta);

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
				}),
				totalCount
			};
		} else {
			const { profile } = await checkUser(this.rmqService, userId, userRole);
			const { apartments, totalCount } = await this.apartmentRepository.findByUser(userId, userRole, meta);

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
				}),
				totalCount
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
