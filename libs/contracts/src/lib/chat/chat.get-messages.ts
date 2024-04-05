import { IChatUser, IGetChat, IMessageGroupByCreatedAt, UserRole } from '@myhome/interfaces';
import { IsNumber, IsString, Validate } from 'class-validator';
import { IsValidEnumValue } from '../enum.validator';

export namespace GetMessages {
    export const topic = 'chat.get-messages.command';

    export class Request {
        @IsString({ message: "Id чата должен быть строкой" })
        chatId!: string;

        @IsNumber({}, { message: "Id отправителя должен быть числом" })
        userId!: number;

        @Validate(IsValidEnumValue, [UserRole])
        userRole!: UserRole;
    }

    export class Response {
        messages!: IMessageGroupByCreatedAt[];
        chat!: IGetChat;
        users!: IChatUser[];
    }
}