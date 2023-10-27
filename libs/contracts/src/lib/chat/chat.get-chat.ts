import { IGetChat } from '@myhome/interfaces';

export namespace GetChat {
    export const topic = 'chat.get-chat.query';

    export class Request {
        chat!: IGetChat;
    }
}

