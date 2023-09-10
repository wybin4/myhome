import { IOption, IVoting } from "@myhome/interfaces";
import { IsNumber } from "class-validator";

export namespace GetVoting {
    export const topic = 'voting.get-voting.query';

    export class Request {
        @IsNumber()
        id!: number;
    }

    export class Response {
        voting!: IVoting;
        options!: IOption[];
    }
}
