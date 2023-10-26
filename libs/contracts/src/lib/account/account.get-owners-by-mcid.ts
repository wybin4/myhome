import { IsNumber } from 'class-validator';
import { IUser } from '@myhome/interfaces';

export namespace AccountGetOwnersByMCId {
  export const topic = 'account.get-owners-by-mcid.query';

  export class Request {
    @IsNumber({}, { message: "Id управляющей компании должен быть числом" })
    managementCompanyId!: number;
  }

  export class Response {
    owners!: Omit<IUser, 'passwordHash'>[];
  }
}
