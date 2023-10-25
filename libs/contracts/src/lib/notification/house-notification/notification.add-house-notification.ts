import { IHouseNotification, HouseNotificationType } from '@myhome/interfaces';
import { IsNumber, IsString, MaxLength, Validate } from 'class-validator';
import { IsValidEnumValue } from '../../enum.validator';

export namespace AddHouseNotification {
    export const topic = 'notification.add-house-notification.command';

    export class Request {
        @IsNumber({}, { message: "Id дома должно быть числом" })
        houseId!: number;

        @Validate(IsValidEnumValue, [HouseNotificationType])
        type!: HouseNotificationType;

        @MaxLength(50, {message: "Максимальная длина заголовка не должна превышать 50 символов"})
        @IsString({ message: "Заголовок должен быть строкой" })
        title!: string;

        @MaxLength(500, { message: "Максимальная длина уведомления не должна превышать 500 символов" })
        @IsString({ message: "Уведомление должно быть строкой" })
        text!: string;

        @IsString()
        createdAt!: string;
    }

    export class Response {
        notification!: IHouseNotification;
    }
}

