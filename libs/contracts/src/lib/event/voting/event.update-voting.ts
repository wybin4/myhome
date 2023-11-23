import { IVote } from "@myhome/interfaces";
import { IsNumber } from "class-validator";

export namespace EventUpdateVoting {
    export const topic = 'event.update-voting.query';

    export class Request {
        @IsNumber({}, { message: "Id варианта ответа должно быть числом" })
        optionId!: number;

        @IsNumber({}, { message: "Id пользователя должен быть числом" })
        userId!: number;
    }

    export class Response {
        vote!: IVote
    }
}
