import { IOption, IVoting } from "@myhome/interfaces";
import { IsNumber } from "class-validator";

export namespace EventGetVoting {
    export const topic = 'event.get-voting.query';

    export class Request {
        @IsNumber({}, { message: "Id опроса должно быть числом" })
        id!: number;
    }

    export class Response {
        voting!: IVoting;
        options!: IOption[];
    }
}
