import { EventType, UserRole } from "@myhome/interfaces";
import { IsArray, IsEnum, IsNumber } from "class-validator";

export class GetEventsDto {
    @IsNumber()
    userId!: number;

    @IsEnum(UserRole)
    userRole!: UserRole;

    @IsArray()
    events!: EventType[];
}