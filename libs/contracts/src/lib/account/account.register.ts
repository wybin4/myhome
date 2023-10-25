import { UserRole } from '@myhome/interfaces';
import { IsEmail, IsOptional, IsString, Validate } from 'class-validator';
import { IsValidEnumValue } from '../enum.validator';

export namespace AccountRegister {
    export const topic = 'account.register.command';

    export class Request {
        @Validate(IsValidEnumValue, [UserRole])
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
