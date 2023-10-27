import { IGetMessage } from '@myhome/interfaces';

export namespace GetMessage {
    export const topic = 'chat.get-message.query';

    export class Request {
        message!: IGetMessage;
    }
}

