import { IServiceNotification, ServiceNotificationType, UserRole } from '@myhome/interfaces';
import { IsNumber, IsOptional, IsString, MaxLength, Validate } from 'class-validator';
import { IsValidEnumValue } from '../../enum.validator';

export namespace AddServiceNotification {
    export const topic = 'notification.add-service-notification.command';

    export class Request {
        @IsNumber({}, { message: "Id пользователя должно быть числом" })
        userId!: number;

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
        notification!: IServiceNotification;
    }
}

