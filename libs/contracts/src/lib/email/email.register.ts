import { IUser } from '@myhome/interfaces';

export namespace EmailRegister {
    export const topic = 'email.register.event';

    export class Request {
        user!: Omit<IUser, 'passwordHash'>;
        html!: string;
    }

    export class Response { }
}
