import { IGetUser, UserRole } from '@myhome/interfaces';
import { IsString, MinLength, Validate } from 'class-validator';
import { IsValidEnumValue } from '../enum.validator';

export namespace AccountSetPassword {
    export const topic = 'account.set-password.command';

    export class Request {
        @IsString()
        link!: string;

        @IsString()
        @MinLength(8)
        password!: string;

        @Validate(IsValidEnumValue, [UserRole])
        userRole!: UserRole;
    }

    export class Response {
        profile!: IGetUser;
    }
}