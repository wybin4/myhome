import { IChatUser, IGetMessage, IMessage } from '@myhome/interfaces';

export namespace ApiEmitMessage {
    export const topic = 'api.emit-message.query';

    export class Request {
        users!: IChatUser[];
        createdMessage!: IGetMessage;
        updatedMessages!: IMessage[];
    }
}

