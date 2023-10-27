import { IChatUser } from "@myhome/interfaces";
import { IsArray, IsString } from "class-validator";

export class AddChatDto {
    @IsArray()
    users!: IChatUser[];
}

export class AddMessageDto {
    @IsString()
    chatId!: string;

    @IsString()
    text!: string;

    sender!: IChatUser;
}

export class GetChatsDto {
    user!: IChatUser;
}