import { IChat } from '@myhome/interfaces';

export namespace ApiEmitChat {
    export const topic = 'api.emit-chat.query';

    export class Request {
        chat!: IChat;
    }
}

