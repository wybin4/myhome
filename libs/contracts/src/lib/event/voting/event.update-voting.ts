import { IOption } from "@myhome/interfaces";
import { IsNumber } from "class-validator";

export namespace EventUpdateVoting {
    export const topic = 'event.update-voting.query';

    export class Request {
        @IsNumber({}, { message: "Id варианта ответа должно быть числом" })
        optionId!: number;
    }

    export class Response {
        option!: IOption
    }
}
