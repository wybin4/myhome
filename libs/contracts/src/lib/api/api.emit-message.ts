import { IGetMessage } from '@myhome/interfaces';

export namespace ApiEmitMessage {
    export const topic = 'api.emit-message.query';

    export class Request {
        message!: IGetMessage;
    }
}

