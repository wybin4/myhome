import { UserRole } from '@myhome/interfaces';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export namespace AccountRegister {
    export const topic = 'account.register.command';

    export class Request {
        @IsString()
        role!: UserRole;

        @IsEmail()
        email!: string;

        @IsString()
        password!: string;

        @IsOptional()
        @IsString()
        name?: string;
    }

    export class Response {
        id!: number;
    }
}
