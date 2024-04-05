import { IChatUser, IGetChat, IGetMessage, UserRole } from '@myhome/interfaces';
import { IsNumber, IsString, Validate } from 'class-validator';
import { IsValidEnumValue } from '../enum.validator';

export namespace ReadMessage {
    export const topic = 'chat.read-message.command';

    export class Request {
        @IsString({ message: "Id сообщения должен быть строкой" })
        messageId!: string;

        @IsString({ message: "Id чата должен быть строкой" })
        chatId!: string;

        @IsNumber({}, { message: "Id отправителя должен быть числом" })
        userId!: number;

        @Validate(IsValidEnumValue, [UserRole])
        userRole!: UserRole;
    }

    export class Response {
        updatedMessage!: IGetMessage;
        chat!: IGetChat;
        users!: IChatUser[];
    }
}