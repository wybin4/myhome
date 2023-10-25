import { HouseNotificationType } from "@myhome/interfaces";
import { IsNumber, IsString, MaxLength, } from "class-validator";

export class GetHouseNotificationsByMCIdDto {
    @IsNumber()
    @IsNumber({}, { message: "Id управляющей компании должен быть числом" })
    managementCompanyId!: number;
}

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

    @IsString()
    createdAt!: string;
}

export class GetHouseNotificationDto {
    @IsNumber()
    id: number;
}
