import { IAppeal } from "@myhome/interfaces";
import { IsNumber } from "class-validator";

export namespace AppealGetAppeal {
    export const topic = 'appeal.get-appeal.query';

    export class Request {
        @IsNumber({}, { message: "Id обращения должен быть числом" })
        id!: number;
    }

    export class Response {
        appeal!: IGetAppeal;
    }
}

export interface IGetAppeal extends IAppeal {
    ownerId: number;
}