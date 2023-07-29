import { IsNumber, } from "class-validator";

export class ReadNotificationDto {
    @IsNumber()
    id: number;
}

export class GetNotificationDto {
    @IsNumber()
    id: number;
}
