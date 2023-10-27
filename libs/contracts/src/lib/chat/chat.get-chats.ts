import { IChat, UserRole } from "@myhome/interfaces";
import { IsNumber, Validate } from "class-validator";
import { IsValidEnumValue } from "../enum.validator";

export namespace GetChats {
    export const topic = 'chat.get-chats.query';

    export class Request {
        @IsNumber({}, { message: "Id отправителя должен быть числом" })
        userId!: number;

        @Validate(IsValidEnumValue, [UserRole])
        userRole!: UserRole;
    }

    export class Response {
        chats!: IChat[];
    }
}
