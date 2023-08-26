import { IsArray, IsString } from 'class-validator';
import { IUser, UserRole } from '@myhome/interfaces';

export namespace AccountUsersInfo {
  export const topic = 'account.users-info.query';

  export class Request {
    @IsArray()
    ids!: number[];

    @IsString()
    role!: UserRole;
  }

  export class Response {
    profiles!: Omit<IUser, 'passwordHash'>[];
  }
}
