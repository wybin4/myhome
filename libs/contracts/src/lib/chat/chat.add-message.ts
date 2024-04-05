import { IChatUser, IGetChat, IGetMessage, UserRole } from '@myhome/interfaces';
import { IsNumber, IsString, MaxLength, Validate } from 'class-validator';
import { IsValidEnumValue } from '../enum.validator';
import { ParseDate } from '../parse.validator';

export namespace AddMessage {
    export const topic = 'chat.add-message.command';

    export class Request {
        @IsString({ message: "Id чата должен быть строкой" })
        chatId!: string;

        @IsString({ message: "Текст быть строкой" })
        @MaxLength(1000, { message: "Максимальная длина сообщения не должна превышать 1000 символов" })
        text!: string;

        @IsNumber({}, { message: "Id отправителя должен быть числом" })
        userId!: number;

        @Validate(IsValidEnumValue, [UserRole])
        userRole!: UserRole;

        @ParseDate({ message: "Неверная дата создания" })
        createdAt!: string;
    }

    export class Response {
        users!: IChatUser[];
        chat!: IGetChat;
        createdMessage!: IGetMessage;
        updatedMessages!: IGetMessage[];
    }
}