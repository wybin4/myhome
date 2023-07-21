import { UserRole } from '@myhome/interfaces';
import { IsEmail, IsString } from 'class-validator';

export namespace AccountLogin {
  export const topic = 'account.login.command';

  export class Request {
    @IsEmail()
    email!: string;

    @IsString()
    password!: string;

    @IsString()
    role!: UserRole;
  }

  export class Response {
    access_token!: string;
  }
}
