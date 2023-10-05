import { IsNumber } from 'class-validator';
import { IUser } from '@myhome/interfaces';

export namespace AccountGetOwnersByMCId {
  export const topic = 'account.get-owners-by-mcid.query';

  export class Request {
    @IsNumber()
    managementCompanyId!: number;
  }

  export class Response {
    owners!: Omit<IUser, 'passwordHash'>[];
  }
}
