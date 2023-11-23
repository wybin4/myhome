import { IsNumber, Validate } from 'class-validator';
import { IGetUser, UserRole } from '@myhome/interfaces';
import { IsValidEnumValue } from '../enum.validator';
import { IGetSubscriberInUser } from '../reference/subscriber/subscriber/reference.get-users-by-another-role';

export namespace AccountGetUsersByAnotherRole {
  export const topic = 'account.get-users-by-another-role.query';

  export class Request {
    @IsNumber({}, { message: "Id пользователя должно быть числом" })
    userId!: number;

    @Validate(IsValidEnumValue, [UserRole])
    userRole!: UserRole;
  }

  export class Response {
    users!: IGetUser[] | IGetProfileWithSubscriber[];
  }
}

export interface IGetProfileWithSubscriber {
  user: IGetUser;
  subscribers: IGetSubscriberInUser[];
}
