import { IChatUser, IGetChat, UserRole } from '@myhome/interfaces';
import { IsArray, IsNumber, Validate } from 'class-validator';
import { IsValidEnumValue } from '../enum.validator';

export namespace AddChat {
    export const topic = 'chat.add-chat.command';

    export class Request {
        @IsArray({ message: "Пользователи должны быть массивом" })
        users!: IChatUser[];

        @IsNumber({}, { message: "Id пользователя должен быть числом" })
        userId!: number;

        @Validate(IsValidEnumValue, [UserRole])
        userRole!: UserRole;

    }

    export class Response {
        chat!: IGetChat;
        users!: IChatUser[];
    }
}

