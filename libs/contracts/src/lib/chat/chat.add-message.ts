import { IChatUser, IGetMessage, IMessage, UserRole } from '@myhome/interfaces';
import { IsNumber, IsString, MaxLength, Validate } from 'class-validator';
import { IsValidEnumValue } from '../enum.validator';

export namespace AddMessage {
    export const topic = 'chat.add-message.command';

    export class Request {
        @IsString({ message: "Id чата должен быть строкой" })
        chatId!: string;

        @IsString({ message: "Текст быть строкой" })
        @MaxLength(1000, { message: "Максимальная длина сообщения не должна превышать 1000 символов" })
        text!: string;

        @IsNumber({}, { message: "Id отправителя должен быть числом" })
        senderId!: number;

        @Validate(IsValidEnumValue, [UserRole])
        senderRole!: UserRole;
    }

    export class Response {
        users!: IChatUser[];
        createdMessage!: IGetMessage;
        updatedMessages!: IMessage[];
    }
}