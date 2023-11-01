import { HouseNotificationType } from "@myhome/interfaces";
import { IsNumber, IsString, MaxLength, } from "class-validator";

export class AddHouseNotificationDto {
    @IsNumber()
    houseId: number;

    @IsString()
    type: HouseNotificationType;

    @MaxLength(50)
    @IsString()
    title!: string;

    @MaxLength(500)
    @IsString()
    text: string;
}