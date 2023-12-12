import { SUBSCRIBER_NOT_EXIST, RMQException, SUBSCRIBER_ALREADY_ARCHIEVED, SUBSCRIBERS_NOT_EXIST, getGenericObjects, checkUsers, SUBSCRIBERS_ALREADY_EXISTS, APARTS_NOT_EXIST, USERS_NOT_EXIST } from "@myhome/constants";
import { SubscriberStatus, UserRole } from "@myhome/interfaces";
import { Injectable, HttpStatus } from "@nestjs/common";
import { SubscriberEntity } from "../entities/subscriber.entity";
import { ApartmentRepository } from "../repositories/apartment.repository";
import { HouseRepository } from "../repositories/house.repository";
import { SubscriberRepository } from "../repositories/subscriber.repository";
import { RMQService } from "nestjs-rmq";
import { ReferenceGetSubscribersByHouses, ReferenceGetSubscribersByUser, ReferenceGetUsersByAnotherRole, ReferenceGetReceiversByOwner, ReferenceGetSubscribers, ReferenceAddSubscribers } from "@myhome/contracts";

export interface IApartmentAndSubscriber {
	subscriberId: number;
	apartmentId: number;
	numberOfRegistered: number;
}

@Injectable()
export class SubscriberService {
	constructor(
		readonly subscriberRepository: SubscriberRepository,
		readonly apartmentRepository: ApartmentRepository,
		readonly houseRepository: HouseRepository,
		readonly rmqService: RMQService,
	) { }

	async addSubscribers(dto: ReferenceAddSubscribers.Request): Promise<ReferenceAddSubscribers.Response> {
		const existed = await this.subscriberRepository.findByApartmentIdAndPersonalAccount(dto.subscribers.map(s => {
			return {
				apartmentId: s.apartmentId,
				personalAccount: s.personalAccount
			}
		}));
		if (existed.length) {
			throw new RMQException(SUBSCRIBERS_ALREADY_EXISTS.message, SUBSCRIBERS_ALREADY_EXISTS.status);
		}
		const apartments = await this.apartmentRepository.findByIdWithHouse(dto.subscribers.map(s => s.apartmentId));
		if (!apartments) {
			throw new RMQException(APARTS_NOT_EXIST.message, APARTS_NOT_EXIST.status);
		}
		const { profiles } = await checkUsers(this.rmqService, dto.subscribers.map(s => s.ownerId), UserRole.Owner);
		if (!profiles) {
			throw new RMQException(USERS_NOT_EXIST.message, USERS_NOT_EXIST.status);
		}

		const newSubscribers = dto.subscribers.map(s =>
			new SubscriberEntity({
				...s,
				status: SubscriberStatus.Active
			})
		);
		const subscribers = await this.subscriberRepository.createMany(newSubscribers);
		return {
			subscribers: subscribers.map(s => {
				const currentApart = apartments.find(a => a.id === s.apartmentId);
				const currentProfile = profiles.find(p => p.id === s.ownerId);
				return {
					...s.get(),
					apartmentName: currentApart.getAddress(currentApart.house),
					ownerName: currentProfile.name
				};
			})
		}
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

	async getSubscribersByHouses(houseIds: number[]): Promise<ReferenceGetSubscribersByHouses.Response> {
		const houses = await this.houseRepository.findManyWithSubscribers(houseIds);
		const ownerIds = houses.map((house) => {
			if (house.apartments) {
				return house.apartments
					.map((apartment) => apartment.subscriber.ownerId);
			}
			return [];
		});

		const flattenedOwnerIds = ownerIds.flat();
		const { profiles: owners } = await checkUsers(this.rmqService, flattenedOwnerIds, UserRole.Owner);

		return {
			houses: houses.map(house => {
				return {
					house: house.get(),
					subscribers: house.apartments.map(apartment => {
						const currentSubscriber = apartment.subscriber;
						const currentOwner = owners.find(obj => obj.id === currentSubscriber.ownerId);
						return {
							id: currentSubscriber.id,
							houseId: house.id,
							name: currentOwner.name,
							address: apartment.getAddress(house, false),
							personalAccount: currentSubscriber.personalAccount,
							apartmentArea: apartment.totalArea,
							livingArea: apartment.livingArea,
							numberOfRegistered: apartment.numberOfRegistered
						};
					})
				};
			}),
		};
	}

	async getSubscribers(dto: ReferenceGetSubscribers.Request): Promise<ReferenceGetSubscribers.Response> {
		if (dto.isAllInfo) {
			const subscribers = await this.subscriberRepository.findByIdsAllInfo(dto.ids);

			const ownerIds = subscribers.map(obj => obj.ownerId);
			const { profiles: owners } = await checkUsers(this.rmqService, ownerIds, UserRole.Owner);

			return {
				subscribers: subscribers.map(subscriber => {
					const currentApart = subscriber.apartment;
					const currentHouse = subscriber.apartment.house;
					const currentOwner = owners.find(obj => obj.id === subscriber.ownerId);
					return {
						id: subscriber.id,
						houseId: currentHouse.id,
						name: currentOwner.name,
						address: currentApart.getAddress(currentHouse),
						personalAccount: subscriber.personalAccount,
						apartmentArea: currentApart.totalArea,
						livingArea: currentApart.livingArea,
						numberOfRegistered: currentApart.numberOfRegistered
					};
				})
			};
		} else {
			return {
				subscribers: await getGenericObjects<SubscriberEntity>
					(
						this.subscriberRepository,
						(item) => new SubscriberEntity(item),
						dto.ids,
						SUBSCRIBERS_NOT_EXIST
					)
			};
		}
	}

	public async getApartmentsBySIDs(subscriberIds: number[]): Promise<IApartmentAndSubscriber[]> {
		const subscribers = await this.subscriberRepository.findManyWithApartments(subscriberIds);

		return subscribers.map(subscriber => {
			return {
				subscriberId: subscriber.id,
				apartmentId: subscriber.apartmentId,
				numberOfRegistered: subscriber.apartment.numberOfRegistered,
			};
		});
	}

	public async getSubscribersByUser({ userId, userRole, meta }: ReferenceGetSubscribersByUser.Request):
		Promise<ReferenceGetSubscribersByUser.Response> {
		switch (userRole) {
			case UserRole.Owner: {
				const { subscribers, totalCount } = await this.subscriberRepository.findByUser(userId, userRole);
				return { subscribers, totalCount };
			}
			case UserRole.ManagementCompany: {
				const { subscribers, totalCount } = await this.subscriberRepository.findByUser(userId, userRole, meta);
				const ownerIds = Array.from(new Set(subscribers.map(s => s.ownerId)));
				const { profiles: ownerItems } = await checkUsers(this.rmqService, ownerIds, UserRole.Owner);

				return {
					subscribers: subscribers.map(subscriber => {
						const currentApart = subscriber.apartment;
						const currentOwner = ownerItems.find(obj => obj.id === subscriber.ownerId);
						const currentHouse = subscriber.apartment.house;
						return {
							...subscriber.get(),
							ownerName: currentOwner.name,
							houseId: currentHouse.id,
							houseName: currentHouse.getAddress(),
							apartmentName: currentApart.getAddress(currentHouse)
						};
					}),
					totalCount
				};
			}
		}
	}

	async getUsersByAnotherRole(dto: ReferenceGetUsersByAnotherRole.Request):
		Promise<ReferenceGetUsersByAnotherRole.Response> {
		const subscribers = await this.subscriberRepository.findByUserByAnotherRole(dto.userId, dto.userRole);
		switch (dto.userRole) {
			case UserRole.ManagementCompany: {
				const anotherUserIds = subscribers.map(s => s.ownerId);
				return { anotherUserIds };
			}
			case UserRole.Owner: {
				return {
					anotherUserIds: subscribers.map(subscriber => {
						return {
							anotherUserId: subscriber.apartment.house.managementCompanyId,
							subscriber: {
								id: subscriber.id,
								address: subscriber.apartment.getAddress(subscriber.apartment.house, false)
							}
						};
					})
				};
			}
		}
	}

	async getReceiversByOwner(ownerId: number): Promise<ReferenceGetReceiversByOwner.Response> {
		const ownerSubscribers = await this.subscriberRepository.findByOwnerIdAllInfo(ownerId);
		if (!ownerSubscribers) {
			throw new RMQException(SUBSCRIBERS_NOT_EXIST.message, SUBSCRIBERS_NOT_EXIST.status);
		}
		const managementCompanyIds = Array.from(new Set(
			ownerSubscribers.map(
				s => s.apartment.house.managementCompanyId
			)
		));
		let subscribers = await this.subscriberRepository.findByMCIds(
			managementCompanyIds
		);
		subscribers = subscribers.filter(s => s.ownerId !== ownerId);
		const ownerIds = subscribers.map(s => s.ownerId);
		const { profiles: ownerProfiles } = await checkUsers(this.rmqService, ownerIds, UserRole.Owner);

		const { profiles: MCProfiles } = await checkUsers(
			this.rmqService,
			managementCompanyIds,
			UserRole.ManagementCompany
		);

		const receivers = [...ownerProfiles.map(o => {
			return {
				userRole: UserRole.Owner,
				userId: o.id,
				name: o.name
			};
		}), ...MCProfiles.map(mc => {
			return {
				userRole: UserRole.ManagementCompany,
				userId: mc.id,
				name: mc.name
			};
		})];

		return { receivers };
	}

	public async getSubscribersByHId(houseId: number): Promise<IApartmentAndSubscriber[]> {
		const subscribers = await this.subscriberRepository.findByHIds([houseId]);

		return subscribers.map(subscriber => {
			return {
				subscriberId: subscriber.id,
				apartmentId: subscriber.apartmentId,
				numberOfRegistered: subscriber.apartment.numberOfRegistered,
			};
		});
	}
}