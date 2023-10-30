import { IMessage, UserRole } from '@myhome/interfaces';
import { IsNumber, IsString, Validate } from 'class-validator';
import { IsValidEnumValue } from '../enum.validator';

export namespace ReadMessages {
    export const topic = 'chat.read-messages.command';

    export class Request {
        @IsNumber({}, { message: "Id пользователя должен быть числом" })
        userId!: number;

        @Validate(IsValidEnumValue, [UserRole])
        userRole!: UserRole;

        @IsString({ message: "Id чата должно быть строкой" })
        chatId!: string;
    }

    export class Response {
        chatId!: string;
        messages!: IMessage[];
    }
}
