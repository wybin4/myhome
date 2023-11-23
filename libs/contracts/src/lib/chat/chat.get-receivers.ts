import { IGetChatUser, UserRole } from "@myhome/interfaces";
import { IsNumber, Validate } from "class-validator";
import { IsValidEnumValue } from "../enum.validator";

export namespace GetReceivers {
    export const topic = 'chat.get-receivers.query';

    export class Request {
        @IsNumber({}, { message: "Id пользователя должен быть числом" })
        userId!: number;

        @Validate(IsValidEnumValue, [UserRole])
        userRole!: UserRole;
    }

    export class Response {
        receivers!: IGetChatUser[];
    }
}