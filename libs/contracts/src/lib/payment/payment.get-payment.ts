import { IPayment } from "@myhome/interfaces";
import { IsNumber } from "class-validator";

export namespace GetPayment {
    export const topic = 'payment.get-payment.query';

    export class Request {
        @IsNumber()
        id!: number;
    }

    export class Response {
        payment!: IPayment;
    }
}
