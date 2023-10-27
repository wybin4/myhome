import { IOption, IVoting } from "@myhome/interfaces";
import { IsArray, IsDate, IsNumber, IsString, MaxLength } from "class-validator";

export namespace EventAddVoting {
    export const topic = 'event.add-voting.query';

    export class Request {
        @IsNumber({}, { message: "Id дома должно быть числом" })
        houseId!: number;

        @IsString({ message: "Заголовок должен быть строкой" })
        @MaxLength(255, { message: "Максимальная длина заголовка не должна превышать 255 символов" })
        title!: string;

        @IsDate()
        createdAt!: Date;

        @IsDate()
        expiredAt!: Date;

        @IsArray({ message: "Варианты ответа должны быть массивом строк" })
        @MaxLength(255, { message: "Максимальная длина заголовка не должна превышать 255 символов" })
        options!: string[];
    }

    export class Response {
        voting!: IVoting;
        options!: IOption[]
    }
}