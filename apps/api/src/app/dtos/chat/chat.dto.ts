import { IChatUser, UserRole } from "@myhome/interfaces";
import { IsArray, IsEnum, IsNumber, IsString } from "class-validator";

export class AddChatDto {
    @IsArray()
    users!: IChatUser[];
}

export class AddMessageDto {
    @IsString()
    chatId!: string;

    @IsString()
    text!: string;

    @IsNumber()
    senderId!: number;

    @IsEnum(UserRole)
    senderRole!: UserRole;
}

export class ReadMessagesDto {
    @IsString()
    chatId!: string;

    @IsNumber()
    userId!: number;

    @IsEnum(UserRole)
    userRole!: UserRole;
}

export class GetReceiversDto {
    @IsNumber()
    userId!: number;

    @IsEnum(UserRole)
    userRole!: UserRole;
}


export class GetChatsDto {
    @IsNumber()
    userId!: number;

    @IsEnum(UserRole)
    userRole!: UserRole;
}