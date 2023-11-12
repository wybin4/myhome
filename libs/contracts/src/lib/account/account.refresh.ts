import { UserRole } from "@myhome/interfaces";
import { IsNumber, Validate } from "class-validator";
import { IsValidEnumValue } from "../enum.validator";

export namespace AccountRefresh {
  export const topic = 'account.refresh.command';

  export class Request {
    @IsNumber({}, { message: "Id пользователя должен быть числом" })
    id!: string;

    @Validate(IsValidEnumValue, [UserRole])
    userRole!: UserRole;
  }

  export class Response {
    token!: string;
  }
}
