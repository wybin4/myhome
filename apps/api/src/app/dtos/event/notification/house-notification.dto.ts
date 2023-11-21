import { HouseNotificationType } from "@myhome/interfaces";

export class AddHouseNotificationDto {
    houseId: number;
    type: HouseNotificationType;
    title!: string;
    text: string;
}