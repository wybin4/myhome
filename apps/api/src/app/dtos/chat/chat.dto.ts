import { IChatUser } from "@myhome/interfaces";

export class AddChatDto {
    users: IChatUser[];
}

export class AddMessageDto {
    chatId: string;
    text: string;
    createdAt: string;
}

export class GetMessagesDto {
    chatId: string;
}

export class GetReceiversDto { }


export class GetChatsDto { }