import { IChatUser } from "@myhome/interfaces";

export class AddChatDto {
    users!: IChatUser[];
}

export class AddMessageDto {
    chatId!: string;
    text!: string;
}

export class ReadMessagesDto {
    chatId!: string;
}

export class GetReceiversDto { }


export class GetChatsDto { }