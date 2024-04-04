import { IServiceNotification, ServiceNotificationType, UserRole } from '@myhome/interfaces';
import { IsArray, IsOptional, IsString, MaxLength, Validate } from 'class-validator';
import { IsValidEnumValue } from '../../../enum.validator';

export namespace EventAddServiceNotifications {
    export const topic = 'event.add-service-notifications.command';

    export class Request {
        @IsArray({ message: "Id пользователей должны быть массивом чисел" })
        userIds!: number[];

        @Validate(IsValidEnumValue, [UserRole])
        userRole!: UserRole;

        @IsString({ message: "Заголовок должен быть строкой" })
        @MaxLength(255, { message: "Максимальная длина заголовка не должна превышать 255 символов" })
        title!: string;

        @IsString({ message: "Описание должно быть строкой" })
        @IsOptional()
        @MaxLength(255, { message: "Максимальная длина описания не должна превышать 255 символов" })
        description?: string;

        @IsString({ message: "Уведомление должно быть строкой" })
        @MaxLength(500, { message: "Максимальная длина уведомления не должна превышать 500 символов" })
        text!: string;

        @Validate(IsValidEnumValue, [ServiceNotificationType])
        type!: ServiceNotificationType;
    }

    export class Response {
        notifications!: IServiceNotification[];
    }
}

export interface IAddServiceNotifications {
    userIds: number[];
    userRole: UserRole;
    title: string;
    description: string;
    text: string;
    type: ServiceNotificationType;
}

