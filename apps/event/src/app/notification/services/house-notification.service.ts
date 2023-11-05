import { HOUSES_NOT_EXIST, INCORRECT_USER_ROLE, RMQException, checkUsers, getHouseAllInfo, getHousesByMCId, getHousesByOId } from "@myhome/constants";
import { EventAddHouseNotification } from "@myhome/contracts";
import { Injectable } from "@nestjs/common";
import { RMQService } from "nestjs-rmq";
import { HouseNotificationEntity } from "../entities/house-notification.entity";
import { HouseNotificationRepository } from "../repositories/house-notification.repository";
import { IGetHouseNotification, IHouse, IHouseNotification, ServiceNotificationType, UserRole } from "@myhome/interfaces";
import { ServiceNotificationService } from "./service-notification.service";

@Injectable()
export class HouseNotificationService {
    constructor(
        private readonly houseNotificationRepository: HouseNotificationRepository,
        private readonly serviceNotificationService: ServiceNotificationService,
        private readonly rmqService: RMQService,
    ) { }

    public async getHouseNotifications(userId: number, userRole: UserRole): Promise<{ notifications: IGetHouseNotification[] }> {
        switch (userRole) {
            case UserRole.Owner:
                return await this.getNotificationsForOwner(userId);
            case UserRole.ManagementCompany:
                return await this.getNotificationsForMC(userId);
            default:
                throw new RMQException(INCORRECT_USER_ROLE.message, INCORRECT_USER_ROLE.status);
        }
    }

    private async getNotificationsForOwner(userId: number): Promise<{ notifications: IGetHouseNotification[] }> {
        const { houses } = await getHousesByOId(this.rmqService, userId);
        const mcIds = Array.from(new Set(houses.map(h => h.managementCompanyId)));
        const { profiles } = await checkUsers(this.rmqService, mcIds, UserRole.ManagementCompany);

        const { notifications } = await this.getNotificationsGeneral(houses);

        return {
            notifications: notifications.map(notification => {
                const currentHouse = houses.find(house => house.id === notification.houseId);
                const currentMC = profiles.find(mc => mc.id === currentHouse.managementCompanyId);

                return {
                    name: currentMC.name,
                    ...notification
                };
            })
        }
    }

    private async getNotificationsForMC(userId: number): Promise<{ notifications: IGetHouseNotification[] }> {
        const { houses } = await getHousesByMCId(this.rmqService, userId);

        const { notifications } = await this.getNotificationsGeneral(houses);

        return {
            notifications: notifications.map(notification => {
                const currentHouse = houses.find(house => house.id === notification.houseId);
                return {
                    name: `${currentHouse.city}, ${currentHouse.street} ${currentHouse.houseNumber}`,
                    ...notification
                };
            })
        }
    }

    private async getNotificationsGeneral(houses: IHouse[]) {
        if (!houses) {
            throw new RMQException(HOUSES_NOT_EXIST.message, HOUSES_NOT_EXIST.status);
        }
        const houseIds = houses.map(house => house.id);

        const notifications = await this.houseNotificationRepository.findByHouseIds(houseIds);
        if (!notifications) {
            return;
        }

        return { notifications };
    }

    public async addHouseNotification(dto: EventAddHouseNotification.Request):
        Promise<EventAddHouseNotification.Response> {
        const { house } = await getHouseAllInfo(this.rmqService, dto.houseId);

        const newHouseNotificationEntity = new HouseNotificationEntity({
            houseId: dto.houseId,
            title: dto.title,
            text: dto.text,
            type: dto.type,
            createdAt: new Date(),
        });
        const newHouseNotification = await this.houseNotificationRepository.create(newHouseNotificationEntity);

        await this.sendNotifications(
            newHouseNotification,
            house.managementCompanyName,
            house.ownerIds
        );

        return { notification: newHouseNotification };
    }

    private async sendNotifications(
        notification: IHouseNotification,
        managementCompanyName: string,
        ownerIds: number[]
    ) {
        await this.serviceNotificationService.addServiceNotifications(
            {
                userIds: ownerIds,
                userRole: UserRole.Owner,
                title: notification.title,
                description: managementCompanyName,
                text: notification.text,
                type: ServiceNotificationType.HouseNotification,
            }
        );
    }
}