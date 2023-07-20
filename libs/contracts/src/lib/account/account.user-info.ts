import { IsNumber } from 'class-validator';
import { IUser } from '@myhome/interfaces';

export namespace AccountUserInfo {
  export const topic = 'account.user-info.query';

  export class Request {
    @IsNumber()
    id!: number;
  }

  export class Response {
    profile!: Omit<IUser, 'passwordHash'>;
  }
}
