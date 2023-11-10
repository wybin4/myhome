import { IsNumber, Validate } from 'class-validator';
import { IUser, UserRole } from '@myhome/interfaces';
import { IsValidEnumValue } from '../enum.validator';
import { IGetSubscriber } from '../reference/subscriber/subscriber/reference.get-users-by-another-role';

export namespace AccountGetUsersByAnotherRole {
  export const topic = 'account.get-users-by-another-role.query';

  export class Request {
    @IsNumber({}, { message: "Id пользователя должно быть числом" })
    userId!: number;

    @Validate(IsValidEnumValue, [UserRole])
    userRole!: UserRole;
  }

  export class Response {
    users!: Omit<IUser, 'passwordHash'>[] | IGetProfileWithSubscriber[];
  }
}

export interface IGetProfileWithSubscriber {
  user: Omit<IUser, 'passwordHash'>;
  subscribers: IGetSubscriber[];
}
