import { IOption, IVoting } from "@myhome/interfaces";
import { IsArray, IsDate, IsNumber, IsString, MaxLength } from "class-validator";

export namespace AddVoting {
    export const topic = 'voting.add-voting.query';

    export class Request {
        @IsNumber()
        managementCompanyId!: number;

        @IsString()
        @MaxLength(255)
        title!: string;

        @IsDate()
        createdAt!: Date;

        @IsDate()
        expiredAt!: Date;

        @IsArray()
        options!: Omit<IOption, 'votingId'>[];
    }

    export class Response {
        voting!: IVoting;
        options!: IOption[]
    }
}
