import { IGetVoting, IOption, IVoting } from "@myhome/interfaces";
import { IsArray, IsNumber, IsString, MaxLength } from "class-validator";

export namespace EventAddVoting {
    export const topic = 'event.add-voting.query';

    export class Request {
        @IsNumber({}, { message: "Id дома должно быть числом" })
        houseId!: number;

        @IsString({ message: "Заголовок должен быть строкой" })
        @MaxLength(255, { message: "Максимальная длина заголовка не должна превышать 255 символов" })
        title!: string;

        @IsString()
        expiredAt!: string;

        @IsArray({ message: "Варианты ответа должны быть массивом строк" })
        options!: string[];
    }

    export class Response {
        voting!: IAddVoting;
    }
}

export interface IAddVoting extends IVoting {
    options: IOption[];
    name: string;
}