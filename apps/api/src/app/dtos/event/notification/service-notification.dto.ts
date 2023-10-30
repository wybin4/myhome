import { UserRole } from "@myhome/interfaces";
import { IsNumber, IsString } from "class-validator";

export class GetServiceNotificationsDto {
    @IsNumber()
    userId!: number;

    @IsString()
    userRole!: UserRole;
}

export class UpdateServiceNotificationDto {
    @IsNumber()
    id!: number;
}

export class UpdateAllServiceNotificationsDto {
    @IsNumber()
    userId!: number;

    @IsString()
    userRole!: UserRole;
}
