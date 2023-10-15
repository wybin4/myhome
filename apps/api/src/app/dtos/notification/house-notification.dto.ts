import { HouseNotificationType } from "@myhome/interfaces";
import { IsNumber, IsString, MaxLength, } from "class-validator";

export class GetHouseNotificationsByMCIdDto {
    @IsNumber()
    managementCompanyId!: number;
}

export class AddHouseNotificationDto {
    @IsNumber()
    houseId: number;

    @IsString()
    type: HouseNotificationType;

    @MaxLength(500)
    @IsString()
    text: string;

    @IsString()
    createdAt!: string;
}

export class GetHouseNotificationDto {
    @IsNumber()
    id: number;
}
