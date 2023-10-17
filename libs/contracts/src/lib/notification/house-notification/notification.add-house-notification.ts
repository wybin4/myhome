import { IHouseNotification, HouseNotificationType } from '@myhome/interfaces';
import { IsNumber, IsString, MaxLength } from 'class-validator';

export namespace AddHouseNotification {
    export const topic = 'notification.add-house-notification.command';

    export class Request {
        @IsNumber()
        houseId!: number;

        @IsString()
        type!: HouseNotificationType;

        @MaxLength(50)
        @IsString()
        title!: string;

        @MaxLength(500)
        @IsString()
        text!: string;

        @IsString()
        createdAt!: string;
    }

    export class Response {
        notification!: IHouseNotification;
    }
}

