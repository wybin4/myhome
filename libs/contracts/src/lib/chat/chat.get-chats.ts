import { IChat, IChatUser } from "@myhome/interfaces";

export namespace GetChats {
    export const topic = 'chat.get-chats.query';

    export class Request {
        user!: IChatUser;
    }

    export class Response {
        chats!: IChat[];
    }
}
