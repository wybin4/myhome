import { IServiceNotification, ServiceNotificationType, UserRole } from '@myhome/interfaces';
import { IsNumber, IsOptional, IsString, MaxLength, Validate } from 'class-validator';
import { IsValidEnumValue } from '../../enum.validator';

export namespace AddServiceNotification {
    export const topic = 'notification.add-service-notification.command';

    export class Request {
        @IsNumber()
        userId!: number;

        @Validate(IsValidEnumValue, [UserRole])
        userRole!: UserRole;

        @IsString()
        @MaxLength(255)
        title!: string;

        @IsString()
        @IsOptional()
        @MaxLength(255)
        description?: string;

        @IsString()
        @MaxLength(500)
        text!: string;

        @IsString()
        type!: ServiceNotificationType;
    }

    export class Response {
        notification!: IServiceNotification;
    }
}

