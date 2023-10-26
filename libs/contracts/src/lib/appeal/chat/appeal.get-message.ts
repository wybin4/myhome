import { IGetMessage } from '@myhome/interfaces';

export namespace AppealGetMessage {
    export const topic = 'appeal.get-message.query';

    export class Request {
        message!: IGetMessage;
    }
}

