import { IAppeal } from "@myhome/interfaces";
import { IsNumber } from "class-validator";

export namespace AppealGetAppeal {
    export const topic = 'appeal.get-appeal.query';

    export class Request {
        @IsNumber()
        id!: number;
    }

    export class Response {
        appeal!: IAppeal;
    }
}
