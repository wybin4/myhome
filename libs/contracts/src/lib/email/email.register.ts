import { IGetUser } from '@myhome/interfaces';

export namespace EmailRegister {
    export const topic = 'email.register.event';

    export class Request {
        user!: IGetUser;
        html!: string;
    }

    export class Response { }
}
