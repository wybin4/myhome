import { SubscriberStatus, UserRole } from "@myhome/interfaces";
import { IsEnum, IsNumber, IsString } from "class-validator";

export class AddSubscriberDto {
    @IsNumber()
    id?: number;

    @IsNumber()
    ownerId: number;

    @IsNumber()
    apartmentId: number;

    @IsString()
    personalAccount: string;

    @IsString()
    status: SubscriberStatus;
}

export class UpdateSubscriberDto {
    @IsNumber()
    id: number;
}

export class GetSubscribersByUserDto {
    @IsNumber()
    userId: number;

    @IsEnum(UserRole)
    userRole: UserRole;
}
