import { IChatUser, IMessage } from '@myhome/interfaces';

export namespace ApiEmitMessages {
    export const topic = 'api.emit-messages.query';

    export class Request {
        chatId!: string;
        users!: IChatUser[];
        messages!: IMessage[];
    }
}

