import { IsNumber, Validate } from 'class-validator';
import {  IGetUser, UserRole } from '@myhome/interfaces';
import { IsValidEnumValue } from '../enum.validator';

export namespace AccountUserInfo {
  export const topic = 'account.user-info.query';

  export class Request {
    @IsNumber()
    userId!: number;

    @Validate(IsValidEnumValue, [UserRole])
    userRole!: UserRole;
  }

  export class Response {
    profile!: IGetUser;
  }
}
