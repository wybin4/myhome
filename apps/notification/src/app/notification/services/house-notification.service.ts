import { HOUSES_NOT_EXIST, INCORRECT_HOUSE_NOTIF_TYPE, NOTIFICATIONS_NOT_EXIST, NOTIFICATION_NOT_EXIST, RMQException, getGenericObject } from "@myhome/constants";
import { AddHouseNotification, GetHouseNotificationsByMCId, ReferenceGetHouse, ReferenceGetHousesByMCId } from "@myhome/contracts";
import { Injectable } from "@nestjs/common";
import { RMQService } from "nestjs-rmq";
import { HouseNotificationEntity } from "../entities/house-notification.entity";
import { HouseNotificationRepository } from "../repositories/house-notification.repository";
import { HouseNotificationType } from "@myhome/interfaces";

@Injectable()
export class HouseNotificationService {
    constructor(
        private readonly houseNotificationRepository: HouseNotificationRepository,
        private readonly rmqService: RMQService,
    ) { }

    public async getHouseNotificationsByMCId(managementCompanyId: number):
        Promise<GetHouseNotificationsByMCId.Response> {
        const { houses } = await this.getHouseByMCId(managementCompanyId);
        if (!houses) {
            throw new RMQException(HOUSES_NOT_EXIST.message, HOUSES_NOT_EXIST.status);
        }
        const houseIds = houses.map(house => house.id);

        const notifications = await this.houseNotificationRepository.findByHouseIds(houseIds);
        if (!notifications) {
            throw new RMQException(NOTIFICATIONS_NOT_EXIST.message, NOTIFICATIONS_NOT_EXIST.status);
        }
        return {
            notifications: notifications.map(notification => {
                const currentHouse = houses.find(house => house.id === notification.houseId);
                return {
                    houseName: `${currentHouse.city}, ${currentHouse.street} ${currentHouse.houseNumber}`,
                    ...notification
                };
            })
        }
    }

    public async getHouseNotification(id: number) {
        return {
            notification: await getGenericObject<HouseNotificationEntity>
                (
                    this.houseNotificationRepository,
                    (item) => new HouseNotificationEntity(item),
                    id,
                    NOTIFICATION_NOT_EXIST
                )
        };
    }

    public async addHouseNotification(dto: AddHouseNotification.Request):
        Promise<AddHouseNotification.Response> {
        await this.getHouse(dto.houseId);

        if (!Object.values(HouseNotificationType).includes(dto.type)) {
            throw new RMQException(INCORRECT_HOUSE_NOTIF_TYPE.message, INCORRECT_HOUSE_NOTIF_TYPE.status);
        }

        const newHouseNotificationEntity = new HouseNotificationEntity({
            houseId: dto.houseId,
            title: dto.title,
            text: dto.text,
            type: dto.type,
            createdAt: new Date(dto.createdAt),
        });
        const newHouseNotification = await this.houseNotificationRepository.create(newHouseNotificationEntity);
        return { notification: newHouseNotification };
    }

    private async getHouseByMCId(managementCompanyId: number) {
        try {
            return await this.rmqService.send<
                ReferenceGetHousesByMCId.Request,
                ReferenceGetHousesByMCId.Response>
                (ReferenceGetHousesByMCId.topic, { managementCompanyId });
        } catch (e) {
            throw new RMQException(e.message, e.status);
        }
    }

    private async getHouse(id: number) {
        try {
            return await this.rmqService.send<
                ReferenceGetHouse.Request,
                ReferenceGetHouse.Response>
                (ReferenceGetHouse.topic, { id });
        } catch (e) {
            throw new RMQException(e.message, e.status);
        }
    }
}