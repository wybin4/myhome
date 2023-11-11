import { IUser } from '@myhome/interfaces';
import { IsNumber, IsString, MaxLength } from 'class-validator';

export namespace AccountChangeProfile {
  export const topic = 'account.change-profile.command';

  export class Request {
    @IsNumber({}, { message: "Id пользователя должно быть числом" })
    id!: number;

    @IsString({ message: "Имя пользователя должно быть строкой" })
    @MaxLength(100, { message: "Имя пользователя не должно превышать 100 символов" })
    user!: Pick<IUser, 'name'>;
  }

  export class Response { }
}
