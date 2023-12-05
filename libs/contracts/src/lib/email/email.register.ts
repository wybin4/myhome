import { UserRole } from '@myhome/interfaces';

export namespace EmailRegister {
    export const topic = 'email.register.event';

    export class Request {
        email!: string;
        userRole!: UserRole;
        link!: string;
    }

    export class Response { }
}
