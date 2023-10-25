import { IChat, SenderType } from "@myhome/interfaces";
import { IsNumber, Validate } from "class-validator";
import { IsValidEnumValue } from "../../enum.validator";

export namespace AppealGetChats {
    export const topic = 'appeal.get-chats.query';

    export class Request {
        @IsNumber()
        userId!: number;

        @Validate(IsValidEnumValue, [SenderType])
        userType!: SenderType;
    }

    export class Response {
        chats!: IChat[];
    }
}
