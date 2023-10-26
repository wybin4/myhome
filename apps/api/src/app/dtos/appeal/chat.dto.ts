import { SenderType, UserRole } from "@myhome/interfaces";
import { IsEnum, IsNumber, IsString, MaxLength } from "class-validator";

export class AddChatDto {
    @IsNumber()
    appealId: number;
}

export class AddMessageDto {
    @IsString()
    chatId: string;

    @IsString()
    @MaxLength(1000)
    text: string;

    @IsNumber()
    senderId: number;

    @IsEnum(SenderType)
    senderRole: SenderType;
}

export class GetChatsDto {
    @IsNumber()
    userId: number;

    @IsEnum(UserRole)
    userRole: UserRole;
}