import { IPayment, UserRole } from "@myhome/interfaces";
import { IsNumber, Validate } from "class-validator";
import { IsValidEnumValue } from "../enum.validator";

export namespace GetPaymentsByUser {
    export const topic = 'payment.get-payments-by-user.query';

    export class Request {
        @IsNumber({}, { message: "Id пользователя должен быть числом" })
        userId!: number;

        @Validate(IsValidEnumValue, [UserRole])
        userRole!: UserRole;
    }

    export class Response {
        payments!: IPayment[];
    }
}
