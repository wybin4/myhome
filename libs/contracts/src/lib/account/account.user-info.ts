import { IsNumber, IsString } from 'class-validator';
import { IUser, UserRole } from '@myhome/interfaces';

export namespace AccountUserInfo {
  export const topic = 'account.user-info.query';

  export class Request {
    @IsNumber()
    id!: number;

    @IsString()
    role!: UserRole;
  }

  export class Response {
    profile!: Omit<IUser, 'passwordHash'>;
  }
}
