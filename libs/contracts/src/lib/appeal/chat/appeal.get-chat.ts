import { IGetChat } from '@myhome/interfaces';

export namespace AppealGetChat {
    export const topic = 'appeal.get-chat.query';

    export class Request {
        chat!: IGetChat;
    }
}

