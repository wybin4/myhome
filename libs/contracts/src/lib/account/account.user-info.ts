import { IsNumber, Validate } from 'class-validator';
import {  IGetUser, UserRole } from '@myhome/interfaces';
import { IsValidEnumValue } from '../enum.validator';

export namespace AccountUserInfo {
  export const topic = 'account.user-info.query';

  export class Request {
    @IsNumber()
    id!: number;

    @Validate(IsValidEnumValue, [UserRole])
    role!: UserRole;
  }

  export class Response {
    profile!: IGetUser;
  }
}
