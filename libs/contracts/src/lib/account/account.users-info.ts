import { IsArray, Validate } from 'class-validator';
import {  IGetUser, UserRole } from '@myhome/interfaces';
import { IsValidEnumValue } from '../enum.validator';

export namespace AccountUsersInfo {
  export const topic = 'account.users-info.query';

  export class Request {
    @IsArray()
    ids!: number[];

    @Validate(IsValidEnumValue, [UserRole])
    role!: UserRole;
  }

  export class Response {
    profiles!: IGetUser[];
  }
}
