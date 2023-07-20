import { IUser } from '@myhome/interfaces';
import { IsNumber, IsString } from 'class-validator';

export namespace AccountChangeProfile {
  export const topic = 'account.change-profile.command';

  export class Request {
    @IsNumber()
    id!: number;

    @IsString()
    user!: Pick<IUser, 'name'>;
  }

  export class Response { }
}
