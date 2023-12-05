import { UserRole } from '@myhome/interfaces';

export namespace EmailRegisterMany {
    export const topic = 'email.register-many.event';

    export class Request {
        users!: {
            email: string;
            userRole: UserRole;
            link: string;
        }[];
    }

    export class Response { }
}
