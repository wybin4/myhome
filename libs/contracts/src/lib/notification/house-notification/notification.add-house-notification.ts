import { IHouseNotification, HouseNotificationType } from '@myhome/interfaces';
import { IsNumber, IsString, MaxLength, Validate } from 'class-validator';
import { IsValidEnumValue } from '../../enum.validator';

export namespace AddHouseNotification {
    export const topic = 'notification.add-house-notification.command';

    export class Request {
        @IsNumber()
        houseId!: number;

        @Validate(IsValidEnumValue, [HouseNotificationType])
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

