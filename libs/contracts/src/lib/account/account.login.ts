import { UserRole } from '@myhome/interfaces';
import { IsEmail, IsString, Validate } from 'class-validator';
import { IsValidEnumValue } from '../enum.validator';

export namespace AccountLogin {
  export const topic = 'account.login.command';

  export class Request {
    @IsEmail()
    email!: string;

    @IsString()
    password!: string;

    @Validate(IsValidEnumValue, [UserRole])
    role!: UserRole;
  }

  export class Response {
    access_token!: string;
  }
}
