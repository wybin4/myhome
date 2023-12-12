import { Validate } from 'class-validator';
import { IGetUser, UserRole } from '@myhome/interfaces';
import { IsValidEnumValue } from '../enum.validator';
import { MetaRequest } from '../meta.validator';

export namespace AccountGetAllUsers {
  export const topic = 'account.get-all-users.query';

  export class Request extends MetaRequest {
    @Validate(IsValidEnumValue, [UserRole])
    userRole!: UserRole;

    @Validate(IsValidEnumValue, [UserRole])
    requesterRole!: UserRole;
  }

  export class Response {
    profiles!: IGetUser[];
  }
}
